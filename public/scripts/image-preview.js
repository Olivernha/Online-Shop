const imagePicker = document.querySelector("#image-upload-control input");
const imagePreview = document.querySelector("#image-upload-control img");

function updateImagePreview() {
  const file = imagePicker.files;
  if (!file || file.length === 0) {
    imagePreview.style.display = "none";
    return;
  }
  const pickedFile = file[0];

  imagePreview.src = window.URL.createObjectURL(pickedFile);
  imagePreview.style.display = "block";
}
imagePicker.addEventListener("change", updateImagePreview);
