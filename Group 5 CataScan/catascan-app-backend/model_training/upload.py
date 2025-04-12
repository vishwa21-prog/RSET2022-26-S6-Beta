from huggingface_hub import upload_file

# Path to your local model file
local_model_path = "./CataScan_v1_best.h5"

# Repository name (e.g., "your-username/my-awesome-model")
repo_id = "GeorgeET15/CataScan_v1_best"

# Upload the file
upload_file(
    path_or_fileobj=local_model_path,
    path_in_repo="CataScan_v1_best.h5",  # Name it will have in the repo
    repo_id=repo_id,
    repo_type="model"  # Specify it's a model repository
)