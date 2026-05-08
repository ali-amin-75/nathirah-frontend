import os  # We use this to work with folders and file paths
import csv  # We use this to read/write CSV files (labels + dataset index)
import numpy as np  # We use this for image arrays and numeric operations
import pydicom  # We use this to read DICOM (.dcm) medical image files
from PIL import Image  # We use this to convert arrays to images and resize/save PNG
from pydicom.errors import InvalidDicomError  # We use this to catch invalid DICOM files safely


# PATHS 

RAW_DIR = r"D:\GP\data\raw"  # This folder should contain patient folders 
OUTPUT_DIR = r"D:\GP\data\data_processedNew"  # This is where we will save processed PNG images
LABELS_CSV = r"D:\GP\labels.csv"  # This is our labels file 
INDEX_CSV = os.path.join(OUTPUT_DIR, "dataset_index.csv")  # This file will store (image_path,label)

IMG_SIZE = (224, 224)  #  CNN input size 




def safe_get(row, possible_keys):  # Try multiple column names 
    for k in possible_keys:  # Loop over possible header names
        if k in row:  # If this header exists in the current CSV row
            return row[k]  # Return the value from that column
    return None  # If none of the headers exist, return None


def clean_patient_id(x):  # Make patient id consistent remove spaces
    if x is None:  # If missing value
        return None  
    x = str(x).strip()  # Convert to string and remove spaces
    if x == "" or x.lower() in ["na", "np", "none"]:  # Ignore invalid values
        return None  
    return x  # Return cleaned patient id


def clean_label(x):  # Convert label to 0/1 safely
    if x is None:  # If missing
        return None  
    x = str(x).strip()  # Convert to string and remove spaces
    if x == "" or x.lower() in ["na", "np", "none"]:  
        return None  
    try:  # Try to convert to int
        v = int(float(x))  # Sometimes values come as 0.0
    except ValueError:  # If conversion fails
        return None  
    if v not in (0, 1):  # We only accept binary labels
        return None  
    return v  # Return 0 or 1


def normalize_to_uint8(img):  # Normalize image to 0..255 so we can save it as PNG
    img = img.astype(np.float32)  # Convert to float for safe 
    mn = float(np.min(img))  # Minimum pixel value
    mx = float(np.max(img))  # Maximum pixel value
    if mx - mn < 1e-8:  # Avoid division by zero if image is almost constant
        return np.zeros(img.shape, dtype=np.uint8)  # Return black image safely
    img = (img - mn) / (mx - mn)  # Scale values to 0..1
    img = (img * 255.0).clip(0, 255)  # Scale to 0..255 and clip to valid range
    return img.astype(np.uint8)  # Convert to uint8 for saving


def pick_2d_slice(pixel_array):  # Handle 2D or 3D images
    if pixel_array is None:  # If nothing
        return None  # Return None
    if pixel_array.ndim == 2:  # Already 2D (H,W)
        return pixel_array  # Return it 
    if pixel_array.ndim == 3:  # 3D (S,H,W) or (H,W,S) 
        # (S,H,W) is common, we take the middle slice
        mid = pixel_array.shape[0] // 2  # Middle index
        return pixel_array[mid]  # Return middle slice as 2D
    return None  # If it is not 2D/3D


def looks_like_dicom(filename):  # Check extension 
    return filename.lower().endswith(".dcm")  # files are .dcm


# LABELS LOADING

def load_labels(csv_path):  # Read labels CSV
    labels = {}  # This dictionary will store patient labels

    with open(csv_path, "r", encoding="utf-8-sig", newline="") as f:  # utf-8-sig fixes BOM issues
        reader = csv.DictReader(f)  # Read CSV using header row as Dictionary
        print("CSV headers detected:", reader.fieldnames)  # Print headers so we know what the file contains

        for row in reader:  # Loop row by row
            # Patient id can appear with different header names in the file
            pid_raw = safe_get(row, ["Patient ID", "Patient_ID", "patient_id"])  # Try common names
            patient_id = clean_patient_id(pid_raw)  # Clean the patient id

            # Label column also can have different names 
            lab_raw = safe_get(row, ["Recurrence event(s)", "Recurrence"])  # Try common names
            label = clean_label(lab_raw)  # Convert to 0/1 safely

            if patient_id is None:  # If patient id is missing/invalid
                continue  # Skip this row

            if label is None:  # If label is missing/invalid
                continue  # Skip this row

            labels[patient_id] = label  # Save label using patient_id as key

    print("Labels loaded:", len(labels))  # Show how many patients have valid labels
    return labels  # Return dictionary


# MAIN PREPROCESSING

def preprocess_all():  # preprocessing function
    print("Starting preprocessing...")  # Start message

    os.makedirs(OUTPUT_DIR, exist_ok=True)  # Create output folder if it does not exist
    print("OUTPUT_DIR =", OUTPUT_DIR)  # Print output dir to confirm

    labels = load_labels(LABELS_CSV)  # Load patient labels from CSV

    if len(labels) == 0:  # If we failed to read labels
        print(" No labels loaded. Check your labels.csv columns and values.")  # message
        return  # Stop early

    index_rows = []  # We will store [image_path, label] for each saved image
    dicom_found_count = 0  # Count how many dicom files we saw
    saved_count = 0  # Count how many png images we saved

    # Loop over items in RAW_DIR 
    for patient_folder in os.listdir(RAW_DIR):  # List everything in RAW_DIR
        patient_path = os.path.join(RAW_DIR, patient_folder)  # Build full path

        if not os.path.isdir(patient_path):  # If it is not a folder
            continue  # Skip it

        patient_id = clean_patient_id(patient_folder)  # Folder name is the patient id
        if patient_id is None:  # If folder name is invalid
            continue  # Skip

        if patient_id not in labels:  # If we don't have a label for this patient
            continue  # Skip patient

        label = labels[patient_id]  # Get patient label (0/1)

        patient_out_dir = os.path.join(OUTPUT_DIR, patient_id)  # Create a folder for this patient outputs
        os.makedirs(patient_out_dir, exist_ok=True)  # Ensure it exists

        # Walk inside patient folder 
        for root, _, files in os.walk(patient_path):  # root is current folder, files are file names
            for file in files:  # Loop each file in that folder
                if not looks_like_dicom(file):  # If it does not end with .dcm
                    continue  # Skip

                dicom_found_count += 1  # We found a dicom file
                dcm_path = os.path.join(root, file)  # Full DICOM path

                if not os.path.isfile(dcm_path):  # If path is not a file (safety)
                    continue  # Skip

                try:  # Try reading and processing
                    ds = pydicom.dcmread(dcm_path, force=True)  # Read dicom force=True helps with some datasets

                    if not hasattr(ds, "pixel_array"):  # If this dicom has no image pixels
                        continue  # Skip

                    img = ds.pixel_array  # Extract pixel array
                    img2d = pick_2d_slice(img)  # Ensure we have a 2D slice
                    if img2d is None:  # If we failed to get 2D
                        continue  # Skip
                    img2d = normalize_to_uint8(img2d)  # Normalize to 0..255
                    pil_img = Image.fromarray(img2d)  # Convert numpy array to PIL image
                    pil_img = pil_img.convert("L")  # Make sure it is grayscale 
                    pil_img = pil_img.resize(IMG_SIZE, Image.BILINEAR)  # Resize to CNN input size

                    base_name = os.path.splitext(file)[0]  # File name without extension
                    out_png = os.path.join(patient_out_dir, f"{base_name}.png")  # Output PNG path

                    pil_img.save(out_png)  # Save PNG
                    index_rows.append([out_png, label])  # Add row to dataset index

                    saved_count += 1  # Increase saved images count

                except PermissionError:  # If Windows blocks access
                    continue  # Skip
                except InvalidDicomError:  # If file is not a valid dicom
                    continue  # Skip
                except Exception:  # Any other unexpected issue
                    continue  # Skip 

    # dataset_index.csv so training becomes easy
    with open(INDEX_CSV, "w", newline="", encoding="utf-8") as f:  # Open output CSV
        writer = csv.writer(f)  # Create CSV writer
        writer.writerow(["image_path", "label"])  # Header row
        writer.writerows(index_rows)  # Data rows

    print("Preprocessing finished")  
    print("DICOM files found:", dicom_found_count)  # How many dicom files we saw
    print("PNG images saved:", saved_count)  # How many images we saved
    print("Index saved at:", INDEX_CSV)  # Where index file is

    if saved_count == 0:  # If we saved nothing
        print("Saved 0 images. Most common reasons:")  # message
        print("1) No patient folder names match labels patient IDs.")  # Reason 1
        print("2) Your labels CSV rows include only headers/notes and not real data.")  # Reason 2
        print("3) DICOM pixel data is missing or unreadable for these files.")  # Reason 3
        print("4) RAW_DIR structure is different than expected.")  # Reason 4


if __name__ == "__main__":  # Run only if we execute this file directly
    preprocess_all()  # Call preprocessing