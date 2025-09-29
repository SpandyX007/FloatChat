# import os
# import shutil
# import pandas as pd
# import numpy as np
# import geopandas as gpd
# import xarray as xr
# from shapely.geometry import box
# from urllib.request import urlopen
# from datetime import datetime
# import logging

# # Configure logging
# logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')


# def bbox_region_filter(df, bbox, start_date, end_date, samples_per_month=None, random_state=None):
#     """
#     Filter Argo profiles by bounding box and time, optionally downsample per month.
#     """
#     try:
#         if not isinstance(df, pd.DataFrame):
#             raise TypeError("df must be a pandas DataFrame")
#         for col in ['latitude', 'longitude', 'date']:
#             if col not in df.columns:
#                 raise ValueError(f"Missing required column: {col}")

#         if len(bbox) != 4:
#             raise ValueError("bbox must be [min_lon, min_lat, max_lon, max_lat]")

#         df = df.copy()
#         df['date'] = pd.to_datetime(df['date'], errors='coerce')
#         df = df[(df['date'] >= pd.to_datetime(start_date)) & (df['date'] <= pd.to_datetime(end_date))]

#         # Normalize longitudes to [-180, 180]
#         df['longitude'] = df['longitude'].apply(lambda x: x - 360 if pd.notna(x) and x > 180 else x)

#         # Create GeoDataFrame
#         gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df['longitude'], df['latitude']), crs='EPSG:4326')

#         # Filter by bounding box
#         bbox_poly = box(*bbox)
#         gdf = gdf[gdf.geometry.intersects(bbox_poly)].copy()

#         # Downsample per month if requested
#         if samples_per_month:
#             gdf['month_bin'] = gdf['date'].dt.to_period('M')
#             gdf = (gdf.groupby('month_bin', group_keys=False)
#                       .apply(lambda x: x.sample(n=samples_per_month, random_state=random_state)
#                              if len(x) >= samples_per_month else pd.DataFrame())
#                       .reset_index(drop=True))

#         return gdf

#     except Exception as e:
#         logging.error(f"Error in bbox_region_filter: {e}")
#         return gpd.GeoDataFrame(columns=df.columns.tolist() + ['geometry'])


# def generate_full_argo_df_step(df, base_url="https://data-argo.ifremer.fr/dac/", step=5, verbose=True):
#     """
#     Download Argo NetCDF profiles and merge into a single large DataFrame.
#     """
#     temp_dir = "netcdf_temp"
#     all_profiles = []

#     try:
#         if not isinstance(df, pd.DataFrame):
#             raise TypeError("df must be a pandas DataFrame")
#         for col in ['file', 'date', 'latitude', 'longitude']:
#             if col not in df.columns:
#                 raise ValueError(f"Missing required column: {col}")

#         os.makedirs(temp_dir, exist_ok=True)

#         for idx, row in df.iterrows():
#             file_path = row['file']
#             profile_date = row['date']
#             lat = row['latitude']
#             lon = row['longitude']
#             file_url = file_path if file_path.startswith("http") else f"{base_url}{file_path}"
#             local_file = os.path.join(temp_dir, os.path.basename(file_url))

#             try:
#                 if verbose:
#                     logging.info(f"Downloading {file_url}")
#                 with urlopen(file_url) as response:
#                     with open(local_file, "wb") as f:
#                         f.write(response.read())

#                 with xr.open_dataset(local_file, decode_times=True) as ds:
#                     pres = ds["PRES"].values.flatten() if "PRES" in ds else np.array([])
#                     temp = ds["TEMP"].values.flatten() if "TEMP" in ds else np.full_like(pres, np.nan)
#                     psal = ds["PSAL"].values.flatten() if "PSAL" in ds else np.full_like(pres, np.nan)

#                     if pres.size == 0:
#                         continue

#                     mask_valid = ~np.isnan(pres)
#                     pres, temp, psal = pres[mask_valid], temp[mask_valid], psal[mask_valid]

#                     mask_phys = (temp > -2) & (temp < 40) & (psal > 30) & (psal < 40)
#                     pres, temp, psal = pres[mask_phys], temp[mask_phys], psal[mask_phys]

#                     pres_rounded = np.round(pres).astype(int)
#                     mask_step = (pres_rounded % step == 0)
#                     pres, temp, psal = pres_rounded[mask_step], temp[mask_step], psal[mask_step]

#                     if pres.size == 0:
#                         continue

#                     profile_df = pd.DataFrame({
#                         "profile_date": pd.to_datetime(profile_date),
#                         "latitude": lat,
#                         "longitude": lon,
#                         "file_id": os.path.basename(file_url),
#                         "PRES": pres,
#                         "TEMP": temp,
#                         "PSAL": psal
#                     })
#                     all_profiles.append(profile_df)

#             except Exception as e_inner:
#                 logging.warning(f"Skipped {file_url}: {e_inner}")
#                 continue

#     except Exception as e_outer:
#         logging.error(f"Error in generate_full_argo_df_step: {e_outer}")
#         return pd.DataFrame(columns=["profile_date","latitude","longitude","file_id","PRES","TEMP","PSAL"])

#     finally:
#         shutil.rmtree(temp_dir, ignore_errors=True)

#     if all_profiles:
#         ts_df = pd.concat(all_profiles, ignore_index=True)
#         ts_df.sort_values(by=["profile_date","PRES"], inplace=True)
#         return ts_df
#     else:
#         return pd.DataFrame(columns=["profile_date","latitude","longitude","file_id","PRES","TEMP","PSAL"])


# def depth_region_timeseries_derived(df):
#     """
#     Convert high-resolution Argo profile data into monthly depth-region time series
#     with derived metrics. Computes mean TEMP, PSAL, density, buoyancy frequency (N2),
#     and sound speed per depth region, averaged across all profiles in the same month.

#     Parameters
#     ----------
#     df : pd.DataFrame
#         Must contain ['profile_date', 'PRES', 'TEMP', 'PSAL'] columns.

#     Returns
#     -------
#     pd.DataFrame
#         Monthly aggregated DataFrame with derived metrics per depth region.
#     """
#     g = 9.81  # gravity

#     df = df.copy()
#     df['profile_date'] = pd.to_datetime(df['profile_date'])
#     df = df[(df['TEMP'].between(-2, 40, inclusive="both")) &
#             (df['PSAL'].between(30, 40, inclusive="both"))]

#     # Assign month period
#     df['month'] = df['profile_date'].dt.to_period('M')

#     depth_bins = [(0,100), (100,500), (500,1000), (1000,2000)]
#     depth_labels = ['surface_0_100', 'thermocline_100_500',
#                     'upper_mesopelagic_500_1000', 'lower_mesopelagic_1000_2000']

#     # Initialize result DataFrame
#     monthly_timeseries = pd.DataFrame({'month': sorted(df['month'].unique())})

#     for (dmin, dmax), label in zip(depth_bins, depth_labels):
#         temp_vals = []
#         psal_vals = []
#         rho_vals = []
#         n2_vals = []
#         sound_vals = []

#         # Loop over months
#         for month in monthly_timeseries['month']:
#             subset = df[(df['month'] == month) & (df['PRES'] >= dmin) & (df['PRES'] <= dmax)].sort_values("PRES")
#             if subset.empty:
#                 temp_vals.append(np.nan)
#                 psal_vals.append(np.nan)
#                 rho_vals.append(np.nan)
#                 n2_vals.append(np.nan)
#                 sound_vals.append(np.nan)
#                 continue

#             # Profile values within the month
#             T = subset['TEMP'].values
#             S = subset['PSAL'].values
#             P = subset['PRES'].values

#             temp_vals.append(np.nanmean(T))
#             psal_vals.append(np.nanmean(S))

#             rho = 1000 + 0.8*S - 0.2*T
#             rho_vals.append(np.nanmean(rho))

#             drho = np.diff(rho)
#             dz = np.diff(P)
#             mask = dz != 0
#             n2_vals.append(np.nanmean(-g * drho[mask] / (rho[:-1][mask] * dz[mask])) if np.any(mask) else np.nan)

#             c = 1448.96 + 4.591*T - 5.304e-2*T*2 + 2.374e-4*T3 + 1.340(S-35)
#             c += 1.630e-2*P + 1.675e-7*P*2 - 1.025e-2*T(S-35) - 7.139e-13*T*P**3
#             sound_vals.append(np.nanmean(c))

#         # Add monthly aggregated columns
#         monthly_timeseries[f'TEMP_{label}'] = pd.Series(temp_vals)
#         monthly_timeseries[f'PSAL_{label}'] = pd.Series(psal_vals)
#         monthly_timeseries[f'RHO_{label}'] = pd.Series(rho_vals)
#         monthly_timeseries[f'N2_{label}'] = pd.Series(n2_vals)
#         monthly_timeseries[f'SOUND_{label}'] = pd.Series(sound_vals)

#     # Convert 'month' back to datetime at first day of the month
#     monthly_timeseries['month'] = monthly_timeseries['month'].dt.to_timestamp()
#     return monthly_timeseries



# import pandas as pd
# import logging

# logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')


# def run_argo_pipeline(
#     csv_path,
#     bbox,
#     start_date,
#     end_date,
#     samples_per_month=None,
#     random_state=None,
#     step_size=5,
#     base_url="https://data-argo.ifremer.fr/dac/"
# ):
#     """
#     Orchestrates the Argo pipeline:
#     1. Filters CSV profiles by bbox and date
#     2. Downloads and merges NetCDF Argo profiles
#     3. Computes depth-region derived metrics
    
#     Parameters
#     ----------
#     csv_path : str
#         Path to CSV containing grid sampled profiles.
#     bbox : list/tuple
#         [min_lon, min_lat, max_lon, max_lat] bounding box.
#     start_date : str or datetime
#         Start of time window.
#     end_date : str or datetime
#         End of time window.
#     samples_per_month : int, optional
#         Number of profiles to sample per month.
#     random_state : int, optional
#         Random seed for sampling.
#     step_size : int
#         Pressure step for downsampling (default 5 dbar).
#     base_url : str
#         Base URL for Argo DAC files.
    
#     Returns
#     -------
#     pd.DataFrame
#         Depth-region derived DataFrame (last step output).
#     """
#     try:
#         # Step 0: Read CSV
#         logging.info(f"Reading CSV from {csv_path}")
#         df_csv = pd.read_csv(csv_path)

#         # Step 1: Filter by bbox and date
#         logging.info("Filtering profiles by bounding box and date...")
#         df_filtered = bbox_region_filter(
#             df_csv, bbox, start_date, end_date,
#             samples_per_month=samples_per_month,
#             random_state=random_state
#         )
#         logging.info(f"Filtered profiles: {len(df_filtered)}")

#         if df_filtered.empty:
#             logging.warning("No profiles after filtering. Exiting pipeline.")
#             return pd.DataFrame()

#         # Step 2: Download and merge NetCDF profiles
#         logging.info("Downloading and merging NetCDF profiles...")
#         df_merged = generate_full_argo_df_step(
#             df_filtered,
#             base_url=base_url,
#             step=step_size,
#             verbose=True
#         )
#         logging.info(f"Merged profiles count: {len(df_merged)}")

#         if df_merged.empty:
#             logging.warning("No data after merging NetCDF profiles. Exiting pipeline.")
#             return pd.DataFrame()

#         # Step 3: Compute depth-region derived metrics
#         logging.info("Computing depth-region derived metrics...")
#         df_depth_metrics = depth_region_timeseries_derived(df_merged)
#         logging.info("Depth-region metrics computation complete.")

#         # Print the final DataFrame
#         print(df_depth_metrics)

#         return df_depth_metrics

#     except Exception as e:
#         logging.error(f"Pipeline failed: {e}")
#         return pd.DataFrame()


    
# def main_function():
#     final_df = run_argo_pipeline(
#         csv_path="grid_sampled_profiles.csv",
#         bbox=[50.0, 5.0, 75.0, 25.0],
#         start_date="2020-01-01",
#         end_date="2021-01-01",
#         samples_per_month=2,
#         random_state=42,
#         step_size=1
#     )
#     return final_df
    
# main_function()

import os
import shutil
import tempfile
import pandas as pd
import numpy as np
import geopandas as gpd
import xarray as xr
from shapely.geometry import box
from urllib.request import urlopen
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')


def bbox_region_filter(df, bbox, start_date, end_date, samples_per_month=None, random_state=None):
    """
    Filter Argo profiles by bounding box and time, optionally downsample per month.
    """
    try:
        if not isinstance(df, pd.DataFrame):
            raise TypeError("df must be a pandas DataFrame")
        for col in ['latitude', 'longitude', 'date']:
            if col not in df.columns:
                raise ValueError(f"Missing required column: {col}")

        if len(bbox) != 4:
            raise ValueError("bbox must be [min_lon, min_lat, max_lon, max_lat]")

        df = df.copy()
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df = df[(df['date'] >= pd.to_datetime(start_date)) & (df['date'] <= pd.to_datetime(end_date))]

        # Normalize longitudes to [-180, 180]
        df['longitude'] = df['longitude'].apply(lambda x: x - 360 if pd.notna(x) and x > 180 else x)

        # Create GeoDataFrame
        gdf = gpd.GeoDataFrame(df, geometry=gpd.points_from_xy(df['longitude'], df['latitude']), crs='EPSG:4326')

        # Filter by bounding box
        bbox_poly = box(*bbox)
        gdf = gdf[gdf.geometry.intersects(bbox_poly)].copy()

        # Downsample per month if requested
        if samples_per_month:
            gdf['month_bin'] = gdf['date'].dt.to_period('M')
            gdf = (gdf.groupby('month_bin', group_keys=False)
                      .apply(lambda x: x.sample(n=samples_per_month, random_state=random_state)
                             if len(x) >= samples_per_month else pd.DataFrame())
                      .reset_index(drop=True))

        return gdf

    except Exception as e:
        logging.error(f"Error in bbox_region_filter: {e}")
        return gpd.GeoDataFrame(columns=df.columns.tolist() + ['geometry'])


def generate_full_argo_df_step(df, base_url="https://data-argo.ifremer.fr/dac/", step=5, verbose=True):
    """
    Download Argo NetCDF profiles and merge into a single large DataFrame.
    """
    temp_dir = tempfile.mkdtemp(prefix="netcdf_temp_")  # Safe temp dir
    all_profiles = []

    try:
        if not isinstance(df, pd.DataFrame):
            raise TypeError("df must be a pandas DataFrame")
        for col in ['file', 'date', 'latitude', 'longitude']:
            if col not in df.columns:
                raise ValueError(f"Missing required column: {col}")

        for idx, row in df.iterrows():
            file_path = row['file']
            profile_date = row['date']
            lat = row['latitude']
            lon = row['longitude']
            file_url = file_path if file_path.startswith("http") else f"{base_url}{file_path}"
            local_file = os.path.abspath(os.path.join(temp_dir, os.path.basename(file_url)))

            try:
                if verbose:
                    logging.info(f"Downloading {file_url}")
                with urlopen(file_url) as response:
                    with open(local_file, "wb") as f:
                        f.write(response.read())

                with xr.open_dataset(local_file, engine="netcdf4", decode_times=True, decode_timedelta=True) as ds:

                    pres = ds["PRES"].values.flatten() if "PRES" in ds else np.array([])
                    temp = ds["TEMP"].values.flatten() if "TEMP" in ds else np.full_like(pres, np.nan)
                    psal = ds["PSAL"].values.flatten() if "PSAL" in ds else np.full_like(pres, np.nan)

                    if pres.size == 0:
                        continue

                    mask_valid = ~np.isnan(pres)
                    pres, temp, psal = pres[mask_valid], temp[mask_valid], psal[mask_valid]

                    mask_phys = (temp > -2) & (temp < 40) & (psal > 30) & (psal < 40)
                    pres, temp, psal = pres[mask_phys], temp[mask_phys], psal[mask_phys]

                    pres_rounded = np.round(pres).astype(int)
                    mask_step = (pres_rounded % step == 0)
                    pres, temp, psal = pres_rounded[mask_step], temp[mask_step], psal[mask_step]

                    if pres.size == 0:
                        continue

                    profile_df = pd.DataFrame({
                        "profile_date": pd.to_datetime(profile_date),
                        "latitude": lat,
                        "longitude": lon,
                        "file_id": os.path.basename(file_url),
                        "PRES": pres,
                        "TEMP": temp,
                        "PSAL": psal
                    })
                    all_profiles.append(profile_df)

            except Exception as e_inner:
                logging.warning(f"Skipped {file_url}: {e_inner}")
                continue

    except Exception as e_outer:
        logging.error(f"Error in generate_full_argo_df_step: {e_outer}")
        return pd.DataFrame(columns=["profile_date","latitude","longitude","file_id","PRES","TEMP","PSAL"])

    finally:
        shutil.rmtree(temp_dir, ignore_errors=True)

    if all_profiles:
        ts_df = pd.concat(all_profiles, ignore_index=True)
        ts_df.sort_values(by=["profile_date","PRES"], inplace=True)
        return ts_df
    else:
        return pd.DataFrame(columns=["profile_date","latitude","longitude","file_id","PRES","TEMP","PSAL"])


def depth_region_timeseries_derived(df):
    """
    Convert high-resolution Argo profile data into monthly depth-region time series
    with derived metrics: mean TEMP, PSAL, density, buoyancy frequency (N2),
    and sound speed per depth region, averaged across all profiles in the same month.
    """
    g = 9.81  # gravity

    df = df.copy()
    df['profile_date'] = pd.to_datetime(df['profile_date'])
    df = df[(df['TEMP'].between(-2, 40, inclusive="both")) &
            (df['PSAL'].between(30, 40, inclusive="both"))]

    # Assign month period
    df['month'] = df['profile_date'].dt.to_period('M')

    depth_bins = [(0,100), (100,500), (500,1000), (1000,2000)]
    depth_labels = ['surface_0_100', 'thermocline_100_500',
                    'upper_mesopelagic_500_1000', 'lower_mesopelagic_1000_2000']

    monthly_timeseries = pd.DataFrame({'month': sorted(df['month'].unique())})

    for (dmin, dmax), label in zip(depth_bins, depth_labels):
        temp_vals, psal_vals, rho_vals, n2_vals, sound_vals = [], [], [], [], []

        for month in monthly_timeseries['month']:
            subset = df[(df['month'] == month) & (df['PRES'] >= dmin) & (df['PRES'] <= dmax)].sort_values("PRES")
            if subset.empty:
                temp_vals.append(np.nan)
                psal_vals.append(np.nan)
                rho_vals.append(np.nan)
                n2_vals.append(np.nan)
                sound_vals.append(np.nan)
                continue

            T, S, P = subset['TEMP'].values, subset['PSAL'].values, subset['PRES'].values
            temp_vals.append(np.nanmean(T))
            psal_vals.append(np.nanmean(S))

            rho = 1000 + 0.8*S - 0.2*T
            rho_vals.append(np.nanmean(rho))

            drho = np.diff(rho)
            dz = np.diff(P)
            mask = dz != 0
            n2_vals.append(np.nanmean(-g * drho[mask] / (rho[:-1][mask] * dz[mask])) if np.any(mask) else np.nan)

            c = 1448.96 + 4.591*T - 5.304e-2*T**2 + 2.374e-4*T**3 + 1.340*(S-35)
            c += 1.630e-2*P + 1.675e-7*P**2 - 1.025e-2*T*(S-35) - 7.139e-13*T*P**3
            sound_vals.append(np.nanmean(c))

        monthly_timeseries[f'TEMP_{label}'] = pd.Series(temp_vals)
        monthly_timeseries[f'PSAL_{label}'] = pd.Series(psal_vals)
        monthly_timeseries[f'RHO_{label}'] = pd.Series(rho_vals)
        monthly_timeseries[f'N2_{label}'] = pd.Series(n2_vals)
        monthly_timeseries[f'SOUND_{label}'] = pd.Series(sound_vals)

    monthly_timeseries['month'] = monthly_timeseries['month'].dt.to_timestamp()
    return monthly_timeseries


def run_argo_pipeline(
    csv_path,
    bbox,
    start_date,
    end_date,
    samples_per_month=None,
    random_state=None,
    step_size=5,
    base_url="https://data-argo.ifremer.fr/dac/"
):
    try:
        csv_path = os.path.abspath(csv_path)
        logging.info(f"Reading CSV from {csv_path}")
        df_csv = pd.read_csv(csv_path)

        logging.info("Filtering profiles by bounding box and date...")
        df_filtered = bbox_region_filter(
            df_csv, bbox, start_date, end_date,
            samples_per_month=samples_per_month,
            random_state=random_state
        )
        df_filtered.to_csv("map_coordinates.csv",index=False)
        logging.info(f"Filtered profiles: {len(df_filtered)}")

        if df_filtered.empty:
            logging.warning("No profiles after filtering. Exiting pipeline.")
            return pd.DataFrame()

        logging.info("Downloading and merging NetCDF profiles...")
        df_merged = generate_full_argo_df_step(
            df_filtered,
            base_url=base_url,
            step=step_size,
            verbose=True
        )
        logging.info(f"Merged profiles count: {len(df_merged)}")

        if df_merged.empty:
            logging.warning("No data after merging NetCDF profiles. Exiting pipeline.")
            return pd.DataFrame()

        logging.info("Computing depth-region derived metrics...")
        df_depth_metrics = depth_region_timeseries_derived(df_merged)
        logging.info("Depth-region metrics computation complete.")

        print(df_depth_metrics)
        return df_depth_metrics

    except Exception as e:
        logging.error(f"Pipeline failed: {e}")
        return pd.DataFrame()


def main_function():
    final_df = run_argo_pipeline(
        csv_path="grid_sampled_profiles.csv",
        bbox=[105.0, 0.0, 121.0, 23.0],
        start_date="2023-07-30",
        end_date="2024-07-30",
        samples_per_month=2,
        random_state=42,
        step_size=1
    )
    return final_df

# if __name__ == "__main__":
#     main_function()