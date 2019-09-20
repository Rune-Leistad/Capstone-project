function showPost(ident) {
  var dots = document.getElementById("dots" + ident);
  var moreText = document.getElementById("showMore" + ident);
  if (dots.style.display === "none") {
    dots.style.display = "inline";
    moreText.style.display = "none";
  } else {
    dots.style.display = "none";
    moreText.style.display = "inline";
  }
}