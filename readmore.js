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

function cycleViewPosts() {
    var viewFeatured = document.getElementById("featuredPosts");
    var viewAll = document.getElementById("allPosts");
    if (viewFeatured.style.display == "none") {
        viewFeatured.style.display = "inline";
        viewAll.style.display = none;
    }
    else {
        viewFeatures.style.displa = "none";
        viewAll.style.dipslay = "inline";
    }
}