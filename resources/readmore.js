function showPost(ident) {
  var moreText = document.getElementById(ident);
  console.log(ident);
  if (moreText.style.display === "none") {
    moreText.style.display = "none";
  } else {
    moreText.style.display = "inline";
  }
}
