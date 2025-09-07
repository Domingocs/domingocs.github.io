// NPF Post Retrieval v1.5 by domingocs (based on code by cornetespoir
let postsAPI

const postsAPIen = 'https://api.tumblr.com/v2/blog/domingocruzart.tumblr.com/posts?tag=en&api_key=9dQTZQJQZCRMwV9qLVxS15SL6PiXSXP94Fcw3UhZbNQcoyVHkR&npf=true&limit=15'

const postsAPIes = 'https://api.tumblr.com/v2/blog/domingocruzart.tumblr.com/posts?tag=es&api_key=9dQTZQJQZCRMwV9qLVxS15SL6PiXSXP94Fcw3UhZbNQcoyVHkR&npf=true&limit=15'

if (document.documentElement.lang === "es-ES") {
    postsAPI = postsAPIes
}
else {
    postsAPI = postsAPIen
}

if (window.location.href !== "https://www.domingocs.art/") {
    var p = window.location.href
    var q = p.substr(p.length - 1)
    var o = q - 1
    var t = 15 * o
    postsAPI = postsAPI + "&offset=" + t.toString();
}

let postsJSON = $.getJSON(postsAPI, function getPostsJSONFile(data) {
    getPostsData = JSON.stringify(data)
    postsData = JSON.parse(getPostsData)
    postsResponse = postsData.response

    psta = postsResponse.total_posts
    pstaDiv = psta / 15
})
    .done(getAllPosts)
    .fail(failedPostRetrieval)
    .always(cleanAllPosts)
    .always(setPagination);

// Populate posts
function getAllPosts() {

    let regPosts = postsResponse.posts

    let container = document.getElementById('allposts')

    // create images
    function createImage(media) {
        let image = document.createElement('img')
        image.src = media.url
        image.setAttribute('srcset', media.url)
        return image
    }

    // create audio posts 
    function createAudio(content) {
        let audioWrapper = document.createElement('div')
        audioWrapper.classList.add('audio-wrapper')
        let audioPost = document.createElement('div')
        audioPost.classList.add('audio-container')
        audioWrapper.innerHTML = content.embed_html
        return audioWrapper
    }

    // create polls
    function createPoll(content, permalink) {
        let id = permalink.substring(permalink.lastIndexOf("/") + 1);
        let poll = document.createElement('div')
        poll.classList.add('poll')
        poll.append(content.question)
        content.answers.map((answers) => {
            let answer = document.createElement('a')
            answer.classList.add('poll-option')
            answer.target = "_blank"
            answer.href = `https://tumblr.com/${user}/${id}`
            answer.innerHTML = answers.answer_text
            poll.append(answer)
        })
        return poll
    }

    // create links
    function createLink(content) {
        let link = document.createElement('a')
        link.classList.add('post-link')
        link.href = content.url

        let posterImage = document.createElement('i')
        posterImage.classList.add('fa-solid', 'fa-up-right-from-square')
        link.append(posterImage)
        if (content.description) {
            let description = document.createElement('p')
            description.textContent = content.description
            link.append(description)
        }
        return link
    }

    // formats text blocks   
    function createText(content) {
        let str = content.text.replaceAll('<', '&lt;')
        let texts = str.replaceAll('>', '&gt;')
        if (content.text === '') return ''
        let output = ""
        // if there is formatted content
        if (content.formatting) {
            let characters = Array.from(texts.split(''))
            for (const [i, text] of characters.entries()) {
                const char = texts[i]
                // look for end of format
                const endFormatTypes = content.formatting.filter((f) => f.end === i);
                // for each type, create a closing tag
                for (const f of endFormatTypes) {
                    if (f.type === "link") {
                        output += "</a>"
                    }
                    if (f.type === "color") {
                        output += "</span>"
                    }
                    if (f.type === "bold") {
                        output += "</b>"
                    }
                    if (f.type === "small") {
                        output += "</span>"
                    }
                    if (f.type === "mention") {
                        output += "</a>"
                    }
                    if (f.type === "italic") {
                        output += "</i>"
                    }
                }
                // look for start of format
                const startFormatTypes = content.formatting.filter((f) => f.start === i);
                // for each type, create an opening tag 
                for (const f of startFormatTypes) {
                    if (f.type === "link") {
                        output += `<a href="${f.url}">`
                    }
                    if (f.type === "color") {
                        output += `<span style="color:${f.hex}">`
                    }
                    if (f.type === "bold") {
                        output += `<b>`
                    }
                    if (f.type === "small") {
                        output += `<span style="font-size:.8rem">`
                    }
                    if (f.type === "mention") {
                        output += `<a className="mention" href="${f.blog.url}">`;
                    }
                    if (f.type === "italic") {
                        output += `<i>`
                    }
                }
                output += char
            }
        }
        // if no formatting, just output the text 
        else {
            output += texts
        }
        // might scrap this part
        if (content.subtype === "unordered-list-item") {
            let li = document.createElement('li')
            li.classList.add(content.subtype)
            li.innerHTML = output
            return li
        }
        // create an element to put the formatted text in, and then return it  
        else {
            let p = document.createElement('p')
            p.innerHTML = output
            return p
        }
    }

    // create content inside of each row  
    function createRow(content, permalink) {
        // sort through content types      
        switch (content.type) {
            case 'text':
                return createText(content)
                break;

            case 'image':
                return createImage(content.media[3])
                break;

            case 'audio':
                return createAudio(content)
                break;

            case 'link':
                return createLink(content)
                break;

            case 'video':
                if (content.provider === 'tumblr') {
                    let video = document.createElement('video');
                    video.src = content.url;
                    video.muted = true;
                    video.defaultMuted = true;
                    video.controls = true;
                    video.loop = true;
                    video.autoplay = true;
                    return video

                } else {
                    let video = document.createElement('iframe')
                    video.classList.add('video-iframe')
                    video.src = content.embed_iframe?.url ?? content.media.url
                    let videoWidth = content.embed_iframe?.width ?? content.media.width
                    let videoHeight = content.embed_iframe?.height ?? content.media.height
                    video.style.aspectRatio = `${videoWidth} / ${videoHeight}`
                    return video
                }
                break;

            case 'poll':
                return createPoll(content, permalink)
                break;

            // in case there are new post types/types that were missed
            default:
                return `this ${content.type} npf block is not supported yet`
        }
    }

    // create each row  
    function createRows(id, content, layout, permalink, trail = null) {
        let rows = document.createElement('div')
        rows.classList.add('content')
        // if there are indexes with asks 
        let asks = []
        content.map((block) => {
            rows.append(createRow(block, permalink))
        })
        return rows.innerHTML
    }

    // loop through each post in the array
    for (const regPost of regPosts) {
        let npf = regPost.content
        let permalink = regPost.post_url
        let articleId = regPost.id
        let articleTags = regPost.tags
        articleTags = JSON.stringify(articleTags)
        articleTags = articleTags.replaceAll(',', ' ')
        articleTags = articleTags.replaceAll('"', '')
        articleTags = articleTags.replaceAll('[', '')
        articleTags = articleTags.replaceAll(']', '')
        let article = document.createElement('a')

        article.id = articleId
        article.className = articleTags
        article.classList.add('content-container')
        article.href = permalink

        // if it is an original post  
        if (npf.length > 0) {
            let title = document.createElement('h3')
            let titleContent = regPost.summary
            title.append(titleContent)

            let overlay = document.createElement('div')
            overlay.classList.add('post-overlay')

            let content = createRows(regPost.id, regPost.content, regPost.layout, permalink)

            article.innerHTML = content
            article.prepend(title)
            article.prepend(overlay)

        }
        container.append(article)

        console.log("Posts retrieved")
    }

}

// Error Screen if retrieval failed 
function failedPostRetrieval() {
    console.log("error retrieving posts");
    $('#under-construction').css("display", "flex");
}

// Setup posts 
function cleanAllPosts() {
    //reformat media content for multi images
    $('a.content-container.multimg').each(function () {
        if ($(this).children('img').length > 1) {
            $(this).append('<div class="img-mult"></div>');
            $(this).children('.img-mult').append($(this).children('img'));
            $(this).children('.img-mult').children().eq(0).addClass('activeimg');
            $('.img-mult').each(function () {
                var j = 0;
                var m = 2000;
                var className = this;
                autoplay2 = setInterval(function () {
                    if (j > $(className).children().length - 1) { j = 0; }
                    $(className).children().removeClass('activeimg');
                    $(className).children().eq(j).addClass('activeimg');
                    j++;
                }, m);
            });
        }
        if ($(this).children('.content-rows').length > 1) {
            $(this).append('<div class="img-mult"></div>');
            $(this).children('.img-mult').append($(this).children('.content-rows').find('img'));
            $(this).children('.img-mult').children().eq(0).addClass('activeimg');
            $('.img-mult').each(function () {
                var j = 0;
                var m = 2000;
                var className = this;
                autoplay2 = setInterval(function () {
                    if (j > $(className).children().length - 1) { j = 0; }
                    $(className).children().removeClass('activeimg');
                    $(className).children().eq(j).addClass('activeimg');
                    j++;
                }, m);
            });
        }
    });
    console.log("Post retrieval complete");
}

//create pagination
function setPagination() {
    let paga = parseInt(pstaDiv) + 1
    for (let g = 0; g < paga; g++) {
        $('a.menu-button.next').before($('<a class="menu-button jump_page"></a>'));
        let gg = g + 1
        $('a.menu-button.jump_page').eq(g).text(gg)
    }

    $('a.menu-button.jump_page').each(function () {
        if ($(this).text() == 1) {
            $(this).removeClass('jump_page');
            $(this).addClass('current_page');
            $('a.menu-button.prev').css("display", "none");
            $('a.menu-button.next').css("display", "inline-flex");
        }
    });

    console.log("Pagination set");
}

// REPOPULATE WHEN CHANGING LANGUAGE 
$('.enbtn').on("click", function () {
    $("#allposts").children().remove();
    $('.current_page').remove();
    $('.jump_page').remove();
    $('#pinned-section').css("display", "block");
    $('.pinned-section').css("display", "flex");
    postsAPI = postsAPIen;
    if (window.location.href !== "https://www.domingocs.art/") {
        var p = window.location.href
        var q = p.substr(p.length - 1)
        var o = q - 1
        var t = 15 * o
        postsAPI = postsAPI + "&offset=" + t.toString();
    }
    let postsJSON = $.getJSON(postsAPI, function getPostsJSONFile(data) {
        getPostsData = JSON.stringify(data)
        postsData = JSON.parse(getPostsData)
        postsResponse = postsData.response

        psta = postsResponse.total_posts
        pstaDiv = psta / 15
    })
        .done(getAllPosts)
        .fail(failedPostRetrieval)
        .always(cleanAllPosts)
        .always(setPagination);
});
$('.esbtn').on("click", function () {
    $("#allposts").children().remove();
    $('.current_page').remove();
    $('.jump_page').remove();
    $('#pinned-section').css("display", "block");
    $('.pinned-section').css("display", "flex");
    postsAPI = postsAPIes;
    if (window.location.href !== "https://www.domingocs.art/") {
        var p = window.location.href
        var q = p.substr(p.length - 1)
        var o = q - 1
        var t = 15 * o
        postsAPI = postsAPI + "&offset=" + t.toString();
    }
    let postsJSON = $.getJSON(postsAPI, function getPostsJSONFile(data) {
        getPostsData = JSON.stringify(data)
        postsData = JSON.parse(getPostsData)
        postsResponse = postsData.response

        psta = postsResponse.total_posts
        pstaDiv = psta / 15
    })
        .done(getAllPosts)
        .fail(failedPostRetrieval)
        .always(cleanAllPosts)
        .always(setPagination);
});


// REPOPULATE WHEN USING PAGINATION
//Jump Pages
$('.pagination').on("click", '.jump_page', function () {
    $("#allposts").children().remove();
    //add current page class
    $('.current_page').addClass('jump_page');
    $('.current_page').removeClass('current_page');
    $(this).removeClass('jump_page');
    $(this).addClass('current_page');
    //set offset
    var p = $('.current_page').text();
    var q = parseInt(p)
    var o = q - 1
    var t = 15 * o
    postsAPI = postsAPI + "&offset=" + t.toString();

    //call new posts
    let postsJSON = $.getJSON(postsAPI, function getPostsJSONFile(data) {
        getPostsData = JSON.stringify(data)
        postsData = JSON.parse(getPostsData)
        postsResponse = postsData.response

        psta = postsResponse.total_posts
        pstaDiv = psta / 15
    })
        .done(getAllPosts)
        .fail(failedPostRetrieval)
        .always(cleanAllPosts)
        //hide prev or next if needed 
        .always(function () {
            let paga = parseInt(pstaDiv) + 1
            let l1 = paga;
            let l2a = $('.current_page').text();
            let l2 = parseInt(l2a);
            if (l2 === 1) {
                $('a.menu-button.prev').css("display", "none");
                $('a.menu-button.next').css("display", "inline-flex");
            }
            else if (l2 === l1) {
                $('a.menu-button.next').css("display", "none");
                $('a.menu-button.prev').css("display", "inline-flex");
            }
            else {
                $('a.menu-button.next').css("display", "inline-flex");
                $('a.menu-button.prev').css("display", "inline-flex");
            }
        });
});
//Next Page
$('a.menu-button.next').on("click", function () {
    $("#allposts").children().remove();
    //add current page class
    let pgg = $('.current_page').text();
    let pggn = parseInt(pgg)
    let pgnt = pggn + 1
    console.log(pggn);
    console.log(pgnt);
    $('.current_page').addClass('jump_page');
    $('.current_page').removeClass('current_page');

    $('a.menu-button.jump_page').each(function () {
        if ($(this).text() == pgnt) {
            $(this).removeClass('jump_page');
            $(this).addClass('current_page');
        }
    });
    //set offset
    var p = $('.current_page').text();
    var q = parseInt(p)
    var o = q - 1
    var t = 15 * o
    postsAPI = postsAPI + "&offset=" + t.toString();

    //call new posts
    let postsJSON = $.getJSON(postsAPI, function getPostsJSONFile(data) {
        getPostsData = JSON.stringify(data)
        postsData = JSON.parse(getPostsData)
        postsResponse = postsData.response

        psta = postsResponse.total_posts
        pstaDiv = psta / 15
    })
        .done(getAllPosts)
        .fail(failedPostRetrieval)
        .always(cleanAllPosts)
        //hide prev or next if needed 
        .always(function () {
            let paga = parseInt(pstaDiv) + 1
            let l1 = paga;
            let l2a = $('.current_page').text();
            let l2 = parseInt(l2a);
            if (l2 === 1) {
                $('a.menu-button.prev').css("display", "none");
                $('a.menu-button.next').css("display", "inline-flex");
            }
            else if (l2 === l1) {
                $('a.menu-button.next').css("display", "none");
                $('a.menu-button.prev').css("display", "inline-flex");
            }
            else {
                $('a.menu-button.next').css("display", "inline-flex");
                $('a.menu-button.prev').css("display", "inline-flex");
            }
        });
});
//Prev Page
$('a.menu-button.prev').on("click", function () {
    $("#allposts").children().remove();
    //add current page class
    let pgg = $('.current_page').text();
    let pggn = parseInt(pgg)
    let pgnt = pggn - 1
    console.log(pggn);
    console.log(pgnt);
    $('.current_page').addClass('jump_page');
    $('.current_page').removeClass('current_page');

    $('a.menu-button.jump_page').each(function () {
        if ($(this).text() == pgnt) {
            $(this).removeClass('jump_page');
            $(this).addClass('current_page');
        }
    });
    //set offset
    var p = $('.current_page').text();
    var q = parseInt(p)
    var o = q - 1
    var t = 15 * o
    postsAPI = postsAPI + "&offset=" + t.toString();

    //call new posts
    let postsJSON = $.getJSON(postsAPI, function getPostsJSONFile(data) {
        getPostsData = JSON.stringify(data)
        postsData = JSON.parse(getPostsData)
        postsResponse = postsData.response

        psta = postsResponse.total_posts
        pstaDiv = psta / 15
    })
        .done(getAllPosts)
        .fail(failedPostRetrieval)
        .always(cleanAllPosts)
        //hide prev or next if needed 
        .always(function () {
            let paga = parseInt(pstaDiv) + 1
            let l1 = paga;
            let l2a = $('.current_page').text();
            let l2 = parseInt(l2a);
            if (l2 === 1) {
                $('a.menu-button.prev').css("display", "none");
                $('a.menu-button.next').css("display", "inline-flex");
            }
            else if (l2 === l1) {
                $('a.menu-button.next').css("display", "none");
                $('a.menu-button.prev').css("display", "inline-flex");
            }
            else {
                $('a.menu-button.next').css("display", "inline-flex");
                $('a.menu-button.prev').css("display", "inline-flex");
            }
        });
});

// REPOPULATE WHEN NAVIGATING TAGS 
$('a.menu-button.art.entext').on("click", {
    tagu: "art"
}, callTaggedPosts);
$('a.menu-button.design.entext').on("click", {
    tagu: "design"
}, callTaggedPosts);
$('a.menu-button.video.entext').on("click", {
    tagu: "video"
}, callTaggedPosts);
$('a.menu-button.art.estext').on("click", {
    tagu: "arte"
}, callTaggedPosts);
$('a.menu-button.design.estext').on("click", {
    tagu: "diseno"
}, callTaggedPosts);
$('a.menu-button.video.estext').on("click", {
    tagu: "videos"
}, callTaggedPosts);


function callTaggedPosts(event) {

    $("#allposts").children().remove();
    $(".jump_page").remove();
    $(".current_page").remove();
    $('#pinned-section').css("display", "none");
    $('.pinned-section').css("display", "none");

    //$('.pinned-section').children('h1').text(event.data.tagu);
    //if ($('.pinned-section').children('h1').text() === 'diseno') {
    //  $('.pinned-section').children('h1').text('Diseño');
    //}

    let postsAPItag = 'https://api.tumblr.com/v2/blog/domingocruzart.tumblr.com/posts?api_key=9dQTZQJQZCRMwV9qLVxS15SL6PiXSXP94Fcw3UhZbNQcoyVHkR&npf=true&limit=15&tag=';
    postsAPItag = postsAPItag + event.data.tagu;
    console.log(event.data.tagu);

    postsAPI = postsAPItag

    let tagsJSON = $.getJSON(postsAPI, function getPostsJSONFile(data) {
        getPostsData = JSON.stringify(data)
        postsData = JSON.parse(getPostsData)
        postsResponse = postsData.response

        psta = postsResponse.total_posts
        pstaDiv = psta / 15
    })
        .done(getAllPosts)
        .fail(failedPostRetrieval)
        .always(cleanAllPosts)
        .always(setPagination);
}

