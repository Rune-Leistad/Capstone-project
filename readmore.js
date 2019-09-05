function showPost() {
  var dots = document.getElementById("dots");
  var moreText = document.getElementById("showMore");
  var btnText = document.getElementById("openPost");

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    btnText.innerHTML = "Read more";
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    btnText.innerHTML = "Read less";
    moreText.style.display = "inline";
  }
}