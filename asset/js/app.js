const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'F8_PLAYER'
const player = $('.player')
const cd = $('.cd');
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playlist = $('.playlist')

const playBtn = $('.btn-toggle-play');
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isReapeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [{
            name: 'Sau Này Hãy Gặp Nhau Khi Hoa Nở',
            singer: 'Nguyên Hà',
            path: './asset/music/SauNayHayGapLaiNhauKhiHoaNo-NguyenHa-6256923.mp3',
            image: './asset/img/gap_lai_khi_hoa_no.jpg'
        },
        {
            name: 'Thanh Xuân',
            singer: 'Dab Lab',
            path: './asset/music/ThanhXuan-DaLAB-5773854.mp3',
            image: './asset/img/thanh_xuan.jpg'
        },
        {
            name: 'Bước Qua Nhau',
            singer: 'Vũ',
            path: './asset/music/BuocQuaNhau-Vu-7120388.mp3',
            image: './asset/img/buoc_qua_nhau.jpg'
        },
        {
            name: 'Past live',
            singer: 'Børns',
            path: './asset/music/PastlivesSapientdreamRemix-BORNS-6297959.mp3',
            image: './asset/img/past_live.jpg'
        },
        {
            name: 'Matchanah 2',
            singer: 'Híu, Bâu',
            path: './asset/music/Matchanah-HiuBau-6964032.mp3',
            image: './asset/img/mathchah.jpg'
        },
        {
            name: 'Qua nhà anh chơi',
            singer: 'Phaos',
            path: './asset/music/QuaNhaAnhChoi-PhaosHuynhSang-6084371.mp3',
            image: './asset/img/qua_nha_anh_choi.jpg'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.getItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
        <div class="song ${index === this.currentIndex ? 'active' :''}" data-index="${index}">
        <div class="thumb" style="background-image: url('${song.image}')">
        </div>
        <div class="body">
            <h3 class="title">${song.name}</h3>
            <p class="author">${song.singer}</p>
        </div>
        <div class="option">
            <i class="fas fa-ellipsis-h"></i>
        </div>
    </div>
        `
        })
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })

    },
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth
            //Xử lý cd quay và dừng
        const cdThumbAnimate = cdThumb.animate([{
                transform: 'rotate(360deg)'
            }], {
                duration: 10000, //quay 10s
                iterations: Infinity
            })
            //xử lý phóng to thu nhỏ
        document.onscroll = function() {
                const scrollTop = document.documentElement.scrollTop;
                const newCdWidth = cdWidth - scrollTop;

                cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
                cd.style.opacity = newCdWidth / cdWidth
            }
            //xử lý kho click play
        playBtn.onclick = function() {
                if (_this.isPlaying) {
                    audio.pause();
                    cdThumbAnimate.pause();
                } else {
                    audio.play();
                    cdThumbAnimate.play();
                }

            }
            //khi bài hát được play
        audio.onplay = function() {
                _this.isPlaying = true;
                player.classList.add('playing');
            }
            //khi bài hát ngừng
        audio.onpause = function() {
                _this.isPlaying = false;
                player.classList.remove('playing');
            }
            //khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
                if (audio.duration) {
                    const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                    progress.value = progressPercent
                }
                // xử lý khi tua bài hát
                progress.onchange = function(e) {
                    const seekTime = audio.duration / 100 * e.target.value
                    audio.currentTime = seekTime
                }
            }
            //khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }
        prevBtn.onclick = function() {
                _this.prevSong()
                audio.play()
                _this.render()
                _this.render()
                _this.scrollToActiveSong()
            }
            //xử lý bật/ tắt random song
        randBtn.onclick = function(e) {
                _this.isRandom = !_this.isRandom
                _this.setConfig('isRandom', _this.isRandom)
                randBtn.classList.toggle("active", _this.isRandom)

            }
            //Xử lý phát lại 1 song
        repeatBtn.onclick = function(e) {
                _this.isReapeat = !_this.isReapeat
                _this.setConfig('isReapeat', _this.isReapeat)

                repeatBtn.classList.toggle("active", _this.isReapeat)
            }
            //xử lý next song khi audio end
        audio.onended = function() {
                if (_this.isReapeat) {
                    audio.play()
                }
                nextBtn.click()
                console.log(123)
            }
            //lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('option')) {
                // xử lí khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    audio.play()
                    _this.render()
                }
                if (e.target.closest('.option')) {

                }
                //xử lý khi click vào song option
            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        }, 300)
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isReapeat = this.config.isReapeat
            // Object.assign(this,this.config)

    },
    loadCurrentSong: function() {

        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
        console.log(heading, cdThumb, audio)
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()

    },

    start: function() {
        //gán cấu hình từ config vào ứng dụng
        this.loadConfig()
            //định nghĩa các thuộc tính cho object

        this.defineProperties()

        //lắng nghe và xử lý các sự kiện (DOM events)
        this.handleEvents()
            //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()
            //Render playlist
        this.render()
            //hiển thị trạng thái ban đầu của button reapat & random
        randBtn.classList.toggle("active", _this.isRandom)

        repeatBtn.classList.toggle("active", _this.isReapeat)
    },


}
app.start();