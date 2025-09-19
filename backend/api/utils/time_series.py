import xarray as xr
import pandas as pd
import numpy as np
from urllib.request import urlopen
from io import BytesIO

def argo_profiles_to_timeseries(file_df, base_url="ftp://ftp.ifremer.fr/ifremer/argo/dac/", pres_step=50):
    """
    Convert Argo NetCDF profiles to long-form time-series DataFrame with pressure resampled at fixed increments.
    
    Args:
        file_df: pd.DataFrame with at least columns ['file', 'date', 'latitude', 'longitude']
        base_url: Base FTP URL for Argo DAC files
        pres_step: Pressure increment in dbar to resample the profile (default 25 dbar)
        
    Returns:
        pd.DataFrame with columns ['profile_date', 'latitude', 'longitude', 'PRES', 'TEMP', 'PSAL']
    """
    all_profiles = []

    for idx, row in file_df.iterrows():
        file_path = row['file']
        profile_date = row.get('date', pd.NaT)
        lat = row.get('latitude', np.nan)
        lon = row.get('longitude', np.nan)

        # Construct full URL if needed
        if not (file_path.startswith("ftp://") or file_path.startswith("http://") or file_path.startswith("https://")):
            file_path = base_url + file_path

        try:
            # Stream NetCDF from FTP
            with urlopen(file_path) as response:
                data = BytesIO(response.read())
                with xr.open_dataset(data) as ds:
                    pres = ds["PRES"].values.flatten() if "PRES" in ds else np.array([0])
                    temp = ds["TEMP"].values.flatten() if "TEMP" in ds else np.full_like(pres, np.nan)
                    psal = ds["PSAL"].values.flatten() if "PSAL" in ds else np.full_like(pres, np.nan)

                    # Define new pressure levels
                    pres_new = np.arange(0, np.nanmax(pres)+pres_step, pres_step)

                    # Interpolate TEMP and PSAL onto new pressure grid
                    temp_interp = np.interp(pres_new, pres, temp, left=np.nan, right=np.nan)
                    psal_interp = np.interp(pres_new, pres, psal, left=np.nan, right=np.nan)

                    profile_df = pd.DataFrame({
                        "profile_date": profile_date,
                        "latitude": lat,
                        "longitude": lon,
                        "PRES": pres_new,
                        "TEMP": temp_interp,
                        "PSAL": psal_interp
                    })
                    all_profiles.append(profile_df)
        except Exception as e:
            print(f"⚠️ Failed to process {file_path}: {e}")

    if all_profiles:
        ts_df = pd.concat(all_profiles, ignore_index=True)
    else:
        ts_df = pd.DataFrame(columns=["profile_date", "latitude", "longitude", "PRES", "TEMP", "PSAL"])

    return ts_df
