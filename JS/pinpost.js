// get Pinned Posts v1.3 by domingocs
    let pinnedAPI

    const pinnedAPIen = 'https://api.tumblr.com/v2/blog/domingocruzart.tumblr.com/posts?tag=pinned&api_key=9dQTZQJQZCRMwV9qLVxS15SL6PiXSXP94Fcw3UhZbNQcoyVHkR&npf=true'

    const pinnedAPIes = 'https://api.tumblr.com/v2/blog/domingocruzart.tumblr.com/posts?tag=pineado&api_key=9dQTZQJQZCRMwV9qLVxS15SL6PiXSXP94Fcw3UhZbNQcoyVHkR&npf=true'

    //change posts to retrieve according to language
    if (document.documentElement.lang === "es-ES") {
      pinnedAPI = pinnedAPIes
    }
    else {
      pinnedAPI = pinnedAPIen
    }

    let pinnedJSON = $.getJSON(pinnedAPI, function getJSONFile(data) {
      getPinnedData = JSON.stringify(data)
      pinnedData = JSON.parse(getPinnedData)
      pinnedResponse = pinnedData.response
    })
      .done(getPinnedPosts)
      .fail(hidePinnedPosts)
      .always(cleanPinnedPosts);

    // Populate Pinned posts
    function getPinnedPosts() {
      let pinnedPosts = pinnedResponse.posts
      //console.log(pinnedPosts.length)

      let pinnedContainer = document.getElementById('pinnedposts')

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
          p.classList.add(content.subtype)
          p.innerHTML = output
          return p
        }
      }

      // create content inside of each row 1 
      function createRow1(content, permalink) {
        // sort through content types      
        switch (content.type) {

          case 'image':
            return createImage(content.media[2])
            break;

          case 'video':
            if (content.provider === 'tumblr') {
              let video = document.createElement('video')
              video.src = content.url
              video.controls = true
              video.loop = true
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

          default:
            return ``
        }
      }

      // create content inside of each row 2
      function createRow2(content, permalink) {
        // sort through content types      
        switch (content.type) {
          case 'text':
            return createText(content)
            break;

          case 'audio':
            return createAudio(content)
            break;

          case 'link':
            return createLink(content)
            break;

          case 'poll':
            return createPoll(content, permalink)
            break;

          // in case there are new post types/types that were missed
          default:
            return ``
        }
      }

      // create each row 1
      function createRows1(id, content, layout, permalink, trail = null) {
        let rows1 = document.createElement('div')
        rows1.classList.add('col1')
        content.map((block) => {
          rows1.append(createRow1(block, permalink))
        })
        return rows1
      }
      // create each row 2 
      function createRows2(id, content, layout, permalink, trail = null) {
        let rows2 = document.createElement('div')
        rows2.classList.add('col2')
        // if there are indexes with asks 
        let asks = []
        content.map((block) => {
          rows2.append(createRow2(block, permalink))
        })
        return rows2
      }

      // loop through each post in the array
      for (const pinnedPost of pinnedPosts) {
        let pnpf = pinnedPost.content
        let pPermalink = pinnedPost.post_url
        let pArticleId = pinnedPost.id
        let pArticleTags = pinnedPost.tags
        pArticleTags = JSON.stringify(pArticleTags)
        pArticleTags = pArticleTags.replaceAll(',', ' ')
        pArticleTags = pArticleTags.replaceAll('"', '')
        pArticleTags = pArticleTags.replaceAll('[', '')
        pArticleTags = pArticleTags.replaceAll(']', '')
        let pArticle = document.createElement('article')

        pArticle.id = pArticleId
        pArticle.className = pArticleTags
        pArticle.classList.add('sldcrd')
        pArticle.href = pPermalink

        // if it is an original post  
        if (pnpf.length > 0) {
          let ptitle = document.createElement('h2')
          let ptitleContent = pinnedPost.summary
          ptitle.append(ptitleContent)
          let ptitleLink = document.createElement('a')
          ptitleLink.href = pPermalink
          ptitleLink.append(ptitle)

          let Ptag = document.createElement('div')
          Ptag.classList.add('tagLabel')
          let PtagLabel = document.createElement('h3')
          Ptag.append(PtagLabel)

          let pContent = document.createElement('div')
          pContent.classList.add('pinned-content-container')

          let pCol1 = document.createElement('div')
          pCol1.classList.add('pinned-column', 'pinned-img')
          let pCol2 = document.createElement('div')
          pCol2.classList.add('pinned-column', 'pinned-text')

          pCol1.append(createRows1(pinnedPost.id, pinnedPost.content, pinnedPost.layout, pPermalink))

          pCol2.append(createRows2(pinnedPost.id, pinnedPost.content, pinnedPost.layout, pPermalink))
          pCol2.prepend(ptitleLink)

          pContent.append(pCol1, pCol2)
          pArticle.append(pContent)
          pArticle.prepend(Ptag)
        }
        pinnedContainer.append(pArticle)

        console.log("Pinned posts retrieved");
      }
    }

    // Hide Pinned Section if retrieval failed 
    function hidePinnedPosts() {
      console.log("error retrieving pinned posts");
      if ($('.pin-slider-bullets').is(':empty')) {
        $('#pinned-section').css("display", "none");
        $('.pinned-section').css("display", "none");
      }
    }

    // Set up Pinned Section
    function cleanPinnedPosts() {
      //create pinned posts bullets and place them in container
      //$('.content-container').removeClass("pinned");
      //$('.content-container').removeClass('pineado');
      //$('.pineado').addClass("pinned");
      $('.sldcrd').before($('<span class="sldbtn"></span>'));
      $('.sldbtn').each(function () {
        $(this).attr('class', $('.sldbtn + article').attr('class'));
      });
      $('.pinned-content > span').appendTo('.pin-slider-bullets');
      $('.pin-slider-bullets > span').removeClass("sldcrd");
      $('.pin-slider-bullets > span').addClass("sldbtn");
      console.log("Pinned post Bullets set");
      //Set Pinned Posts Active classes
      $('.pinned-content').find(".sldcrd").eq(0).addClass('activecard');
      $('.pin-slider-bullets').children().eq(0).addClass('slct');

      //reformat media content
      $('.pinned-img > .col1').each(function () {
        if ($(this).children('video').length >= 1) {
          $(this).parent().addClass("pinned-vid");
          $(this).parent().removeClass("pinned-img");
          $(this).parent().append($(this).children('video'));
          $(this).remove();
        }
        else if ($(this).children('img').length > 1) {
          $(this).removeClass("col1");
          $(this).addClass('img-mult');
          $(this).children().eq(0).addClass('activeimg');
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
        else {
          $(this).parent().append($(this).children());
          $(this).remove();
        }
      });

      //Set Pinned Posts Labels
      $('.pinned-content > article').each(function () {
        if ($(this).hasClass('video')) {
          $(this).children('.tagLabel').children('h3').text("{Video}");
        }
        else if ($(this).hasClass('art')) {
          $(this).children('.tagLabel').children('h3').text("Art");
        }
        else if ($(this).hasClass('design')) {
          $(this).children('.tagLabel').children('h3').text("Design");
        }
        else if ($(this).hasClass('videos')) {
          $(this).children('.tagLabel').children('h3').text("Video");
        }
        else if ($(this).hasClass('arte')) {
          $(this).children('.tagLabel').children('h3').text("Arte");
        }
        else if ($(this).hasClass('diseno')) {
          $(this).children('.tagLabel').children('h3').text("Diseño");
        }
        else {
          $(this).children('.tagLabel').children('h3').text("{block:English}Other{/block:English}{block:Spanish}Otro{/block:Spanish}");
        }
      });

      console.log("Pinned post retrieval complete");
    }

    // REPOPULATE WHEN CHANGING LANGUAGE 
    $('.enbtn').on("click", function () {
      $("#pinnedposts").children('article').remove();
      $(".pin-slider-bullets").children().remove();
      pinnedAPI = pinnedAPIen;
      let pinnedJSON = $.getJSON(pinnedAPI, function getJSONFile(data) {
        getPinnedData = JSON.stringify(data)
        pinnedData = JSON.parse(getPinnedData)
        pinnedResponse = pinnedData.response
      })
        .done(getPinnedPosts)
        .fail(hidePinnedPosts)
        .always(cleanPinnedPosts);
    });
    $('.esbtn').on("click", function () {
      $("#pinnedposts").children('article').remove();
      $(".pin-slider-bullets").children().remove();
      pinnedAPI = pinnedAPIes;
      let pinnedJSON = $.getJSON(pinnedAPI, function getJSONFile(data) {
        getPinnedData = JSON.stringify(data)
        pinnedData = JSON.parse(getPinnedData)
        pinnedResponse = pinnedData.response
      })
        .done(getPinnedPosts)
        .fail(hidePinnedPosts)
        .always(cleanPinnedPosts);
    });

