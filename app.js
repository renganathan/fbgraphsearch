/*
 	Based on the facade pattern
	http://addyosmani.com/resources/essentialjsdesignpatterns/book/
*/
var fbAdapter = (function() {
    //All privately held helper functions are included here
    var _private = {
        /*
            This function inits dom references  for use later
         */
        initDomRefs: function() {
            this.searchBox = document.getElementById("searchBox");
            this.resultsDiv = document.getElementById("searchResults");
            this.resultsCountSpan = document.getElementById("searchResultCount");
            this.favoritesDiv = document.getElementById("favoritesContainer");
        },
        /*
            This function removes all child elements from the favorites container, or the results containerbased on an argument. 
        */
        removeAllFavorites: function(clearFavs) {
            var targetParent;
            if (clearFavs) {
                targetParent = _private.favoritesDiv
            } else {
                targetParent = _private.resultsDiv;
            }
            while (targetParent.firstChild) {
                // Way more faster than using innerHTML=""
                targetParent.removeChild(targetParent.firstChild);
            }
        },
        /*
            Event handler for localStorage. Removes all favorites and renders new results thereby refreshing the stored favorites
        */
        renderFavorites: function() {
            var currentFavs = localStorage.getItem("favs");
            //If there are any favs in the storage, render it on screen
            if (currentFavs != null) {
                var currentFavsObj = JSON.parse(currentFavs);
                _private.removeAllFavorites(true);
                _private.renderResults(currentFavsObj, true);
            }
        },
        /*
            Function which stores favorites. Acts as an event handler for the favorite button click.
        */
        storeFavorite: function(evt) {
            var targetId = evt.target.id;
            //Chcek if the browser supports webstorage
            if (typeof(localStorage) != "undefined") {
                // Read attributes from the dom element
                var category = evt.target.getAttribute("data-category");
                var name = evt.target.getAttribute("data-name");
                //Get the current local storage favs
                var currentFavs = localStorage.getItem("favs");
                var currentFavsObj = [];
                //If there are favs, load them, or else use the blank array as starting point
                if (currentFavs != null) {
                    currentFavsObj = JSON.parse(currentFavs);
                    //Check for duplicates, if found, do not add the same record again
                    for (var i = 0; i < currentFavsObj.length; i++) {
                        if (targetId == currentFavsObj[i]["id"]) {
                            alert("You have already added this page to your favorites!");
                            return false;
                        }
                    }
                }
                currentFavsObj.push({
                    id: targetId,
                    category: category,
                    name: name
                });
                //Dump the values in the current clicked favimg data attrs into the local storage
                localStorage.setItem("favs", JSON.stringify(currentFavsObj));
                _private.renderFavorites();
            } else {
                alert("Your browser doesnt support HTML 5 webstorage. Please use a modern browser");
            }
        },
        /*
            Function to render results on screen, handles dom required for this operation also and adds event handlers as appropriate
         */
        renderResults: function(response, renderFavs) {
            var dataObj = response["data"] ? response["data"] : response;
            //Loop through and display results in the results div
            for (var i = 0; i < dataObj.length; i++) {
                var currentResponseObject = dataObj[i];
                var resultRow = document.createElement("div");
                var nameDiv = document.createElement("div");
                var categoryDiv = document.createElement("div");
                var favoriteImg = document.createElement("a");
                if (!renderFavs) {
                    //Add the fav icon
                    favoriteImg.className = "favIcon";
                    favoriteImg.href = "#";

                    //Add some attributes for the favicon anchor so that we get to find out what values were present in this context
                    favoriteImg.id = currentResponseObject.id;
                    favoriteImg.setAttribute("data-category", currentResponseObject["category"]);
                    favoriteImg.setAttribute("data-name", currentResponseObject["name"]);
                    favoriteImg.addEventListener("click", _private.storeFavorite);
                    nameDiv.appendChild(favoriteImg);
                }
                nameDiv.textContent = currentResponseObject["name"];
                nameDiv.className = "nameContainer";
                categoryDiv.textContent = currentResponseObject["category"];
                categoryDiv.className = "categoryContainer";
                nameDiv.appendChild(categoryDiv);


                nameDiv.appendChild(favoriteImg);
                resultRow.appendChild(nameDiv);
                if (!renderFavs) {
                    _private.resultsDiv.appendChild(resultRow);
                    //scroll to the top
                    _private.favoritesDiv.scrollTop = _private.favoritesDiv.scrollHeight;
                } else {
                    _private.favoritesDiv.appendChild(resultRow);
                    //scroll to the top
                    _private.favoritesDiv.scrollTop = _private.favoritesDiv.scrollHeight;
                }
            }
        },
        /*
            Handle FB API's search responses
        */
        searchResponseHandler: function(response) {
            if (response && !response.error) {
                //Remove any previous results which are present here in the results div
                _private.removeAllFavorites(false);

                //Show the count
                _private.resultsCountSpan.textContent = response.data.length;
                _private.renderResults(response, false);
            }
        },
        /* 
            Handle key down events on the search box
        */
        searchKeydownHandler: function(evt) {
            // Create a new script element
            var script_element = document.createElement('script');
            var requestObj = {
                access_token: '714152905313943|58919bc2f35cf8958a9e9264bc03c3fe',
                callback: 'fbAdapter.searchResponseHandler',
                method: 'get',
                pretty: '0',
                q: this.value,
                sdk: 'joey',
                type: 'page'
            };
            // Set its source to the JSONP API
            script_element.src = 'https://graph.facebook.com/search?' + Utils.serialize(requestObj);

            // Stick the script element in the page <head>
            document.getElementsByTagName('head')[0].appendChild(script_element);
        }
    };

    return {
        /*
            Entry point for the program
        */
        init: function() {
            _private.initDomRefs();
            // Add an event listener on the search box
            _private.searchBox.addEventListener("keyup", _private.searchKeydownHandler);
            _private.renderFavorites();
        },
        /*
            Handle FB API's search responses
        */
        searchResponseHandler: function(response) {

            if (response && !response.error) {
                //Remove any previous results which are present here in the results div
                _private.removeAllFavorites(false);

                //Show the count
                _private.resultsCountSpan.textContent = response.data.length;
                _private.renderResults(response, false);
            }
        }
    };
}());

/*
 Used window.onload here to inject Facebook JS SDK into the webpage
 */
window.onload = fbAdapter.init;