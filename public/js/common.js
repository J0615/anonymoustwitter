$("#postTextarea, #replyTextarea").keyup((event) => {
    let textbox = $(event.target);
    let val = textbox.val().trim();

    let isModal = textbox.parents(".modal").length === 1;

    let submitButton = isModal ? $(submitReplyButton) : $(submitPostButton);

    if (!submitButton) {
        return alert("No submit button alert");
    }
    if (!val) {
        submitButton.prop("disabled", true);
        return;
    }
    submitButton.prop("disabled", false);

})
$("#submitPostButton, #submitReplyButton").click((event) => {
    let button = $(event.target);
    let isModal = button.parents(".modal").length === 1;
    let textBox = isModal ? $("#replyTextarea") : $("#postTextarea")


    let data = {
        content: textBox.val(),
    }
    if (isModal) {
        let id = button.data().id;
        if (!id) {
            return alert("ID is null");
        }
        data.replyTo = id;
    }


    $.post("/api/posts", data, (postData) => {
        // Check if a new post is a reply or not, refresh the page after reply
        if (postData.replyTo) {
            //reload the page
            location.reload()
        } else {
            let html = createPostHtml(postData);
            $(".postsContainer").prepend(html);
            textBox.val("")
            button.prop("disabled", true);
        }
    })
})

//When the modal opens, get the id of the post that needs to be shown in the modal pop up window
$("#replyModal").on("show.bs.modal", (event) => {
    let button = $(event.relatedTarget);
    let postId = getPostIdFromElement(button);
    $("#submitReplyButton").data("id", postId);

    $.get("/api/posts/" + postId, results => {
        outputPosts(results, $("#originalPostContainer"))
    })
})

$("#replyModal").on("hidden.bs.modal", (event) => {
        $("#originalPostContainer").html("");
    }
)


$(document).on("click", ".likeButton", (event) => {
    let button = $(event.target);
    let postId = getPostIdFromElement(button);

    if (!postId) {
        return;
    }

    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: (postData) => {
            button.find("span").text(postData.likes.length || "");
            if (postData.likes.includes(userLoggedIn._id)) {
                button.addClass("active")
            } else {
                button.removeClass("active")
            }

        }
    })


})


//Get id of the individual post for updating
function getPostIdFromElement(element) {
    let isRoot = element.hasClass("post");
    let rootElement = isRoot ? element : element.closest(".post");
    let postId = rootElement.data().id;


    if (!postId) {
        return alert("Postid undefined")
    }
    return postId
}


function createPostHtml(postData) {
    let postedBy = postData.postedBy;
    if (postedBy._id === undefined) {
        return console.log("Not populated")
    }


    let timestamp = timeDifference(new Date(), new Date(postData.createdAt));
    let likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? "active" : ""




    //Rendering the posts, data-id used for identifying the individual post
    return `<div class='post' data-id="${postData._id}">

                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='header'>
                            <span class='date'>${timestamp}</span>
                        </div>
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class="postButtonContainer red">
                                <button class="likeButton ${likeButtonActiveClass}">
                                    <i class="fas fa-angle-up"></i>
                                    <span>${postData.likes.length || ""}</span>
                                </button>
                                <button data-toggle="modal" data-target="#replyModal">
                                    <i class="far fa-comment"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {

    let msPerMinute = 60 * 1000;
    let msPerHour = msPerMinute * 60;
    let msPerDay = msPerHour * 24;
    let msPerMonth = msPerDay * 30;
    let msPerYear = msPerDay * 365;

    let elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (elapsed / 1000 < 30) return "Just now";

        return Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    } else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    } else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    } else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}

function outputPosts(results, container) {
    container.html("");

    if (!Array.isArray(results)) {
        results = [results];
    }


    results.forEach(result => {
        let html = createPostHtml(result);
        container.append(html)
    })

    if (!results) {
        container.append("<span>Nothing to show</span>")
    }
}