class DiscordCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        /* this.colors = {
            status: {
                online: "rgba(67,181,129,1)",
                idle: "rgba(250,166,26,1)",
                dnd: "rgba(240,71,71,1)",
                streaming: "rgba(100,61,167,1)"
            },
            game: "rgba(108,130,207,1)",
            spotify: "rgba(28,176,80,1)",
            //misc
            listening: "rgba(108,207,159,1)",
            watching: "rgba(94,25,229,1)"
        }; */
        this.size = 1;
    }

    setConfig(config) {
        if (this.shadowRoot.lastChild) { this.shadowRoot.removeChild(this.shadowRoot.lastChild); }
        this.config = Object.assign({}, config);

        if(!String(this.config["entity"]).match(/^sensor\.discord_.*_[0-9]{4}/)){
            throw new Error('Invalid entity');
        }

        if (this.config["show_custom_status"] == undefined) this.config["show_custom_status"] = true;
        if (this.config["show_game"] == undefined) this.config["show_game"] = true;
        if (this.config["show_spotify"] == undefined) this.config["show_spotify"] = true;
        if (this.config["show_streaming"] == undefined) this.config["show_streaming"] = true;
        if (this.config["show_misc"] == undefined) this.config["show_misc"] = false;

        let card = document.createElement("ha-card");

        card.appendChild(document.createElement("style")).innerHTML = `
            ha-card {
                display:grid;
                grid-template-columns: 100%;
                border-radius: .5em;
                /* colors */
                --status-color-online: rgba(67,181,129,1);
                --status-color-idle: rgba(250,166,26,1);
                --status-color-dnd: rgba(240,71,71,1);
                --status-color-streaming: rgba(100,61,167,1);
                --status-color-offline: rgba(122,122,122,1);
                --game: rgba(108,130,207,1);
                --spotify: rgba(28,176,80,1);
                --streaming: rgba(100,61,167,1);
                --raw-listening: rgba(108,207,159,1);
                --raw-watching: rgba(94,25,229,1);
                /* positioning */
                --img-size: 4em;
                --img-column-size: 4.5em;
                --text-padding: .5em;
                --container-padding: 1em;
            }
            ha-card > div:first-of-type {
                border-top-left-radius: .5em;
                border-top-right-radius: .5em;
            }
            .last_element {
                border-bottom-left-radius: .5em;
                border-bottom-right-radius: .5em;
            }
            .container {
                padding: var(--container-padding);
            }
            .text-container {
                padding-left: calc(var(--container-padding) + var(--text-padding) + var(--img-column-size));
            }

            /* Status/Header */
            #header {
                display: grid;
                grid-template-columns: var(--img-column-size) auto;
                grid template-rows: 70% 30%;
                grid-gap: 5px;
                align-content: center;
                background: var(--status-color);
            }
            #avatar {
                grid-row: 1 / span 2;
                width: var(--img-size);
                border-radius: 50%;
            }
            #name, #status {
                padding-left: var(--text-padding);
            }
            #name {
                margin-top: auto;
                margin-bottom: auto;
                font-size: 120%;
            }
            #statusText {
                font-style: italic;
                padding-left: .5em;
            }
            #statusCustomEmoji, #statusDot {
                width: 15px;
                margin: auto 0;
            }
            #statusDot {
                height: 1em;
                width: 1em;
                border-radius: 50%;
                background: var(--status-color);
                border: 1px solid #000;
            }

            /* Game */
            #game {
                background: var(--game);
            }

            /* Streaming */
            #streaming {
                background: var(--streaming);
            }
            #streamingLink:link, #streamingLink:visited, #streamingLink:hover, #streamingLink:active {
                color: #fff;
                text-decoration: none;
                margin: auto 0;
                font-style: italic;
            }

            /* Spotify */
            #spotify {
                display: grid;
                grid-template-columns: var(--img-column-size) auto;
                grid template-rows: 40% 30% 30%;
                align-content: center;
                background: var(--spotify);
            }
            #spotifyCover {
                grid-row: 1 / span 3;
                width: var(--img-size);
                border-radius: 3px;
                margin: auto 0;
                display: block;
            }
            #spotifyTitle, #spotifyArtist, #spotifyAlbum, #spotifyTitle:link, #spotifyTitle:visited, #spotifyTitle:hover, #spotifyTitle:active {
                color: #000;
                text-decoration: none;
                padding-left: var(--text-padding);
                margin: auto 0;
            }
            #spotifyTitle,  {
                font-size: 120%;
            }
            #spotifyArtist, #spotifyAlbum {
                font-size: 90%;
            }

            /* Misc */
            /* Listening */
            #misc_listening {
                background: var(--raw-listening);
            }
            #rawListeningLink:link, #rawListeningLink:visited, #rawListeningLink:hover, #rawListeningLink:active,
            #rawWatchingLink:link, #rawWatchingLink:visited, #rawWatchingLink:hover, #rawWatchingLink:active {
                color: #000;
                text-decoration: none;
                margin: auto 0;
                font-style: italic;
            }
            #misc_watching {
                background: var(--raw-watching);
            }
        `;

        //Header
        let header = document.createElement("div");
        header.classList.add("container");
        header.appendChild(document.createElement("img")).id = "avatar";
        header.appendChild(document.createElement("div")).id = "name";
        let status = document.createElement("div");
        status.id = "status";
        status.appendChild(document.createElement("div")).id = "statusDot";
        status.appendChild(document.createElement("div")).id = "statusEmoji";
        status.appendChild(document.createElement("img")).id = "statusCustomEmoji";
        header.appendChild(status).appendChild(document.createElement("span")).id = "statusText";

        card.appendChild(header).id = "header";

        //Game
        let game = document.createElement("div");
        game.classList.add("container");
        game.classList.add("text-container");
        card.appendChild(game).id = "game";

        // Streaming
        let stream = document.createElement("div");
        stream.classList.add("container");
        stream.classList.add("text-container");
        stream.appendChild(document.createElement("span")).id = "streamingInfo"
        stream.appendChild(document.createElement("a")).id = "streamingLink";
        card.appendChild(stream).id = "streaming";

        //Spotify
        let spotify = document.createElement("div");
        spotify.classList.add("container");
        spotify.appendChild(document.createElement("img")).id = "spotifyCover";
        let spotifyLink = document.createElement("a");
        spotifyLink.target = "_blank";
        spotifyLink.style.display = "block";
        spotify.appendChild(spotifyLink).id = "spotifyTitle";
        spotify.appendChild(document.createElement("div")).id = "spotifyArtist";
        spotify.appendChild(document.createElement("div")).id = "spotifyAlbum";

        card.appendChild(spotify).id = "spotify";

        this.shadowRoot.appendChild(card);

        // Misc: Listening
        let rawListening = document.createElement("div")
        rawListening.classList.add("container");
        rawListening.classList.add("text-container");
        stream.appendChild(document.createElement("span")).id = "rawListeningInfo";
        rawListening.appendChild(document.createElement("a")).id = "rawListeningLink";
        card.appendChild(rawListening).id = "rawListening";
        // Misc: Watching
        let rawWatching = document.createElement("div")
        rawWatching.classList.add("container");
        rawWatching.classList.add("text-container");
        rawWatching.classList.add("last_element");
        stream.appendChild(document.createElement("span")).id = "rawWatchingInfo";
        rawWatching.appendChild(document.createElement("a")).id = "rawWatchingLink";
        card.appendChild(rawWatching).id = "rawWatching";
    }

    _updateCard(state, attributes, language) {
        if(this.config["show_custom_status"] && !attributes.hasOwnProperty("custom_emoji_url")) {
            console.warn("discord-card: You don't seem to use the right fork! Custom emotes can't be shown!");
            console.log(attributes["custom_emoji"]);
            console.log(String(attributes["custom_emoji"]));
            if(!String(attributes["custom_emoji"]).match(/^\ud83c[\udf00-\udfff]|\ud83d[\udc00-\ude4f]|\ud83d[\ude80-\udeff]/)) {
                attributes["custom_emoji"] = null;
                attributes["custom_emoji_url"] = null;
            } else {
                attributes["custom_emoji_url"] = null;
            }
        }
        let show_game = this.config["show_game"] && attributes["game"] !== null;
        let show_streaming = this.config["show_streaming"] && attributes["streaming"] !== null;
        let show_spotify = this.config["show_spotify"] && attributes["spotify_title"] !== null;
        let show_rawListening = !show_spotify && this.config["show_misc"] && attributes["listening"] !== null;
        let show_rawWatching = this.config["show_misc"] && attributes["watching"] !== null;

        this.size = 1 + show_game + show_streaming + show_spotify + show_rawListening + show_rawWatching;
        
        // Userinfo
        this.shadowRoot.getElementById("name").textContent = attributes["friendly_name"];
        this.shadowRoot.getElementById("avatar").src = attributes["entity_picture"];

        // Status
        // - Emoji/Dot
        let img = this.shadowRoot.getElementById("statusCustomEmoji");
        let emoji = this.shadowRoot.getElementById("statusEmoji");
        let dot = this.shadowRoot.getElementById("statusDot");
        if(attributes["custom_emoji_url"] !== null && attributes["custom_emoji_url"] !== "" && this.config["show_custom_status"]) {
            img.src = attributes["custom_emoji_url"];
            img.alt = attributes["custom_emoji"];
            img.style.display = "inline-block";
            emoji.style.display = "none";
            dot.style.display = "none";
        } else if(attributes["custom_emoji"] !== null && this.config["show_custom_status"]) {
            emoji.textContent = attributes["custom_emoji"];
            emoji.style.display = "inline-block";
            dot.style.display = "none";
            img.style.display = "none";
        } else {
            dot.style.display = "inline-block";
            emoji.style.display = "none";
            img.style.display = "none";
        }
        // - Text
        if(attributes["streaming"]) { state = "streaming"; }
        if(attributes["custom_status"] && this.config["show_custom_status"]) {
            this.shadowRoot.getElementById("statusText").textContent = attributes["custom_status"];
        } else {
            this.shadowRoot.getElementById("statusText").textContent = state;
        }
        // - Header color
        let element_header = this.shadowRoot.getElementById("header");
        element_header.style.setProperty("--status-color", "var(--status-color-" + state + ")");
        if(!(show_game || show_streaming || show_spotify || show_rawListening || show_rawWatching)) {
            element_header.classList.add("last_element");
        } else {
            element_header.classList.remove("last_element");
        }

        // Game
        let element_game = this.shadowRoot.getElementById("game");
        if(show_game) {
            element_game.textContent = (language === "de") ? "spielt " + attributes["game"] : "is playing " + attributes["game"];
            element_game.style.display = "block";
            if (!(show_spotify || show_streaming || show_rawListening || show_rawWatching)) {
                element_game.classList.add("last_element");
            } else {
                element_game.classList.remove("last_element");
            }
        } else {
            element_game.style.display = "none";
        }

        // Streaming
        let element_streaming = this.shadowRoot.getElementById("streaming");
        if(show_streaming) {
            let info = this.shadowRoot.getElementById("streamingInfo");
            let link = this.shadowRoot.getElementById("streamingLink");
            info.textContent = (language === "de") ? "streamt " : "is streaming ";
            link.setAttribute("href", attributes["streaming_url"]);
            link.textContent = attributes["streaming"];
            element_streaming.style.display = "block";
            if(!(show_spotify || show_rawListening || show_rawWatching)) {
                element_streaming.classList.add("last_element");
            } else {
                element_streaming.classList.remove("last_element");
            }
        } else {
            element_streaming.style.display = "none";
        }

        // Spotify
        let element_spotify = this.shadowRoot.getElementById("spotify");
        if(show_spotify) {
            this.shadowRoot.getElementById("spotifyCover").src = attributes["spotify_album_cover_url"];
            this.shadowRoot.getElementById("spotifyTitle").textContent = attributes["spotify_title"];
            this.shadowRoot.getElementById("spotifyTitle").setAttribute("href", "https://open.spotify.com/track/" + attributes["spotify_track_id"]);
            this.shadowRoot.getElementById("spotifyArtist").textContent = attributes["spotify_artist"];
            this.shadowRoot.getElementById("spotifyAlbum").textContent = attributes["spotify_album"];
            element_spotify.style.display = "grid";
            if(!(show_rawListening || show_rawWatching)) {
                element_spotify.classList.add("last_element");
            } else {
                element_streaming.classList.remove("last_element");
            }
        } else {
            element_spotify.style.display = "none";
        }

        // RawListening
        let element_rawListeing = this.shadowRoot.getElementById("rawListening");
        if(show_rawListening){
            let info = this.shadowRoot.getElementById("rawListeningInfo");
            let link = this.shadowRoot.getElementById("rawListeningLink");
            info.textContent = (language === "de") ? "hört " : "is listening to ";
            link.setAttribute("href", attributes["listening_url"]);
            link.textContent = attributes["listening"];
            element_rawListeing.style.display = "block";
            if(!show_rawWatching) {
                element_rawListeing.classList.add("last_element");
            } else {
                element_rawListeing.classList.remove("last_element");
            }
        } else {
            element_rawListeing.style.display = "none";
        }

        // RawWatching
        let element_rawWatching = this.shadowRoot.getElementById("rawWatching");
        if(show_rawWatching){
            let info = this.shadowRoot.getElementById("rawWatchingInfo");
            let link = this.shadowRoot.getElementById("rawWatchingLink");
            info.textContent = (language === "de") ? "schaut " : "is watching ";
            link.setAttribute("href", attributes["watching_url"]);
            link.textContent = attributes["watching"];
            element_rawWatching.style.display = "block";
        } else {
            element_rawWatching.style.display = "none";
        }
    }

    set hass(hass) {
        let state = hass.states[this.config.entity].state;
        if(!state) throw new Error('Invalid entity');
        let attributes = hass.states[this.config.entity].attributes;

        if (state !== this.entityState || attributes !== this.entityAttributes) {
            this._updateCard(state, attributes, hass.language);
            this.entityState = state;
            this.entityAttribues = attributes;
        }
    }

    getCardSize() {
        return this.size;
    }
}

customElements.define('discord-card', DiscordCard);