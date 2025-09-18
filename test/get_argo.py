import pandas as pd
import xarray as xr
import numpy as np
from ftplib import FTP
import os
from pathlib import Path
import warnings
warnings.filterwarnings('ignore')

def download_argo_file(ftp_path, local_dir="argo_data"):
    """Download a single Argo .nc file from FTP with robust error handling."""
    ftp_host = "ftp.ifremer.fr"
    base_path = "/ifremer/argo/dac/"
    
    # Ensure local directory exists
    local_path = Path(local_dir) / ftp_path
    local_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Check if file already exists and is not empty
    if local_path.exists() and local_path.stat().st_size > 0:
        print(f"File already exists: {local_path}")
        return str(local_path)
    
    try:
        print(f"Connecting to {ftp_host}...")
        with FTP(ftp_host, timeout=30) as ftp:
            ftp.login()  # Anonymous login
            ftp.set_pasv(True)
            
            remote_path = base_path + ftp_path
            print(f"Downloading: {remote_path}")
            
            # Download the file
            with open(local_path, "wb") as f:
                ftp.retrbinary(f"RETR {remote_path}", f.write)
            
            # Verify download
            if local_path.exists() and local_path.stat().st_size > 0:
                print(f"Successfully downloaded: {local_path} ({local_path.stat().st_size} bytes)")
                return str(local_path)
            else:
                print(f"Download failed - file is empty or doesn't exist")
                return None
                
    except Exception as e:
        print(f"Error downloading {ftp_path}: {e}")
        if local_path.exists():
            local_path.unlink()  # Remove incomplete file
        return None

def process_nc_file(file_path):
    """Extract data from a single .nc file with comprehensive error handling."""
    try:
        # Check if file exists and is not empty
        if not Path(file_path).exists():
            print(f"File does not exist: {file_path}")
            return None
            
        if Path(file_path).stat().st_size == 0:
            print(f"File is empty: {file_path}")
            return None
        
        # Open dataset
        try:
            ds = xr.open_dataset(file_path, decode_times=False)
        except Exception as e:
            print(f"Cannot open NetCDF file {file_path}: {e}")
            return None
        
        # Initialize data dictionary
        data = {
            'file': os.path.basename(file_path),  # This might cause duplicates
            'full_path': file_path,  # Add this for debugging
            'latitude': np.nan,
            'longitude': np.nan,
            'pressure': np.array([]),
            'temperature': np.array([]),
            'salinity': np.array([]),
        }
        
        
        # Extract coordinates with multiple possible names
        lat_vars = ['LATITUDE', 'latitude', 'lat', 'LAT', 'Latitude']
        lon_vars = ['LONGITUDE', 'longitude', 'lon', 'LON', 'Longitude']
        
        # Find and extract latitude
        for lat_var in lat_vars:
            if lat_var in ds.variables:
                try:
                    lat_vals = ds[lat_var].values
                    if lat_vals.size > 0:
                        lat_flat = lat_vals.flatten()
                        valid_lats = lat_flat[~np.isnan(lat_flat)]
                        if len(valid_lats) > 0:
                            data['latitude'] = float(valid_lats[0])
                            break
                except Exception as e:
                    continue
        
        # Find and extract longitude
        for lon_var in lon_vars:
            if lon_var in ds.variables:
                try:
                    lon_vals = ds[lon_var].values
                    if lon_vals.size > 0:
                        lon_flat = lon_vals.flatten()
                        valid_lons = lon_flat[~np.isnan(lon_flat)]
                        if len(valid_lons) > 0:
                            data['longitude'] = float(valid_lons[0])
                            break
                except Exception as e:
                    continue
        
        # Extract profile data with multiple possible names
        pres_vars = ['PRES', 'pressure', 'pres', 'PRESSURE', 'Pressure']
        temp_vars = ['TEMP', 'temperature', 'temp', 'TEMPERATURE', 'Temperature']
        sal_vars = ['PSAL', 'salinity', 'sal', 'SALINITY', 'Salinity', 'SALT']
        
        pressure = np.array([])
        temperature = np.array([])
        salinity = np.array([])
        
        # Extract pressure
        for pres_var in pres_vars:
            if pres_var in ds.variables:
                try:
                    pressure = ds[pres_var].values.flatten()
                    break
                except Exception as e:
                    continue
        
        # Extract temperature
        for temp_var in temp_vars:
            if temp_var in ds.variables:
                try:
                    temperature = ds[temp_var].values.flatten()
                    break
                except Exception as e:
                    continue
        
        # Extract salinity
        for sal_var in sal_vars:
            if sal_var in ds.variables:
                try:
                    salinity = ds[sal_var].values.flatten()
                    break
                except Exception as e:
                    continue
        
        ds.close()
        
        # Check if we found any oceanographic data
        total_vars = len(pressure) + len(temperature) + len(salinity)
        if total_vars == 0:
            return None
        
        # Handle cases where some variables might be missing
        max_length = max(len(pressure) if len(pressure) > 0 else 0,
                        len(temperature) if len(temperature) > 0 else 0,
                        len(salinity) if len(salinity) > 0 else 0)
        
        if max_length == 0:
            return None
        
        # Pad shorter arrays with NaN
        if len(pressure) == 0:
            pressure = np.full(max_length, np.nan)
        elif len(pressure) < max_length:
            pressure = np.pad(pressure, (0, max_length - len(pressure)), constant_values=np.nan)
        
        if len(temperature) == 0:
            temperature = np.full(max_length, np.nan)
        elif len(temperature) < max_length:
            temperature = np.pad(temperature, (0, max_length - len(temperature)), constant_values=np.nan)
        
        if len(salinity) == 0:
            salinity = np.full(max_length, np.nan)
        elif len(salinity) < max_length:
            salinity = np.pad(salinity, (0, max_length - len(salinity)), constant_values=np.nan)
        
        # Ensure all arrays have the same length
        min_length = min(len(pressure), len(temperature), len(salinity))
        pressure = pressure[:min_length]
        temperature = temperature[:min_length]
        salinity = salinity[:min_length]
        
        # Filter out rows where ALL values are NaN or invalid
        valid_idx = ~(np.isnan(pressure) & np.isnan(temperature) & np.isnan(salinity))
        valid_idx = valid_idx & (pressure >= 0) & (pressure <= 10000)  # Reasonable pressure range
        
        if np.any(valid_idx):
            data['pressure'] = pressure[valid_idx]
            data['temperature'] = temperature[valid_idx]
            data['salinity'] = salinity[valid_idx]
            
            return data
        else:
            return None
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def load_argo_data():
    """Load Argo data, downloading if necessary."""
    profile_paths = [
        "aoml/5906233/profiles/D5906233_001.nc",
        "aoml/5906233/profiles/D5906233_002.nc",
        "aoml/5906234/profiles/D5906234_001.nc",
        "aoml/5906234/profiles/D5906234_002.nc",
        "aoml/5906235/profiles/D5906235_001.nc",
        "coriolis/6903240/profiles/D6903240_001.nc",
        "coriolis/6903240/profiles/D6903240_002.nc",
        "coriolis/6903241/profiles/D6903241_001.nc",
        "meds/4902480/profiles/D4902480_001.nc",
        "meds/4902480/profiles/D4902480_002.nc"
    ]
    
    all_data = []
    
    for i, path in enumerate(profile_paths):
        print(f"Processing {i+1}/{len(profile_paths)}: {path}")
        
        try:
            local_file = download_argo_file(path)
            if local_file:
                data = process_nc_file(local_file)
                if data:
                    all_data.append(data)
                    print(f"✓ Successfully processed {data['file']}")
                else:
                    print(f"✗ Failed to extract data from {path}")
            else:
                print(f"✗ Failed to download {path}")
        except Exception as e:
            print(f"✗ Unexpected error with {path}: {e}")
    
    print(f"\nSuccessfully processed {len(all_data)} profiles!")
    return all_data