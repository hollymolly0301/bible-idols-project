document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const navList = document.getElementById("navList");
    const drawerList = document.getElementById("drawerList");
    const articlePane = document.getElementById("articlePane");
    const introPlaceholder = document.getElementById("introPlaceholder");
    const markdownRender = document.getElementById("markdownRender");
    
    const mobileMenuTrigger = document.getElementById("mobileMenuTrigger");
    const mobileDrawer = document.getElementById("mobileDrawer");
    const closeDrawer = document.getElementById("closeDrawer");
    const drawerOverlay = document.getElementById("drawerOverlay");
    
    const searchBtn = document.getElementById("searchBtn");
    const searchModal = document.getElementById("searchModal");
    const closeSearch = document.getElementById("closeSearch");
    const modalOverlay = document.getElementById("modalOverlay");
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    
    const startReadingBtn = document.getElementById("startReadingBtn");
    const readingProgress = document.getElementById("readingProgress");

    let activeChapterId = null;

    // 1. Mobile Drawer Navigation handlers
    mobileMenuTrigger.addEventListener("click", () => {
        mobileDrawer.classList.add("show");
        drawerOverlay.classList.add("show");
    });

    const hideDrawer = () => {
        mobileDrawer.classList.remove("show");
        drawerOverlay.classList.remove("show");
    };
    closeDrawer.addEventListener("click", hideDrawer);
    drawerOverlay.addEventListener("click", hideDrawer);

    // 2. Search Modal handlers
    const showSearch = () => {
        searchModal.classList.add("show");
        modalOverlay.classList.add("show");
        setTimeout(() => searchInput.focus(), 150);
    };
    const hideSearch = () => {
        searchModal.classList.remove("show");
        modalOverlay.classList.remove("show");
        searchInput.value = "";
        searchResults.innerHTML = "";
    };
    searchBtn.addEventListener("click", showSearch);
    closeSearch.addEventListener("click", hideSearch);
    modalOverlay.addEventListener("click", hideSearch);

    // Escape key to close modals
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            hideDrawer();
            hideSearch();
        }
    });

    // 3. Dynamic Chapter Navigation Rendering
    if (typeof chaptersData !== 'undefined' && Array.isArray(chaptersData)) {
        renderNavigations();
        setupSearchEngine();
    } else {
        markdownRender.innerHTML = `<p class="placeholder-text">데이터를 불러오지 못했습니다. 터미널에서 'node generate_data.js'를 성공적으로 실행했는지 확인해주세요.</p>`;
        markdownRender.style.display = "block";
    }

    function renderNavigations() {
        chaptersData.forEach((chapter, index) => {
            // Clean up titles (cut after parentheses)
            const cleanTitle = chapter.title.split(' (')[0].replace('Chapter ', 'CH');
            
            // Create Desktop Nav Pill Tag Button
            const desktopLi = document.createElement("li");
            const desktopBtn = document.createElement("button");
            desktopBtn.classList.add("nav-btn");
            desktopBtn.innerText = cleanTitle;
            desktopBtn.addEventListener("click", () => {
                selectChapter(chapter.id);
            });
            desktopLi.appendChild(desktopBtn);
            navList.appendChild(desktopLi);

            // Create Mobile Drawer Nav Button
            const mobileLi = document.createElement("li");
            mobileLi.classList.add("drawer-item");
            const mobileBtn = document.createElement("button");
            mobileBtn.classList.add("drawer-btn");
            mobileBtn.innerText = chapter.title;
            mobileBtn.addEventListener("click", () => {
                selectChapter(chapter.id);
                hideDrawer();
            });
            mobileLi.appendChild(mobileBtn);
            drawerList.appendChild(mobileLi);
        });
    }

    // 4. Chapter Selection and Loading
    function selectChapter(chapterId) {
        activeChapterId = chapterId;
        const chapter = chaptersData.find(c => c.id === chapterId);
        if (!chapter) return;

        // Update active classes on buttons
        const desktopBtns = document.querySelectorAll(".nav-btn");
        const mobileBtns = document.querySelectorAll(".drawer-btn");
        
        chaptersData.forEach((c, idx) => {
            if (c.id === chapterId) {
                desktopBtns[idx]?.classList.add("active");
                mobileBtns[idx]?.classList.add("active");
            } else {
                desktopBtns[idx]?.classList.remove("active");
                mobileBtns[idx]?.classList.remove("active");
            }
        });

        // Hide intro placeholder
        introPlaceholder.style.display = "none";

        // Parse and render Markdown via marked.js
        if (typeof marked !== 'undefined') {
            const htmlContent = marked.parse(chapter.content);
            markdownRender.innerHTML = htmlContent;
            markdownRender.style.display = "block";
        } else {
            markdownRender.innerHTML = `<p class="placeholder-text">Marked.js 라이브러리를 로드하지 못했습니다.</p>`;
            markdownRender.style.display = "block";
        }

        // Scroll smoothly to reading pane
        const target = document.getElementById("chapters-anchors");
        target.scrollIntoView({ behavior: "smooth", block: "start" });

        // Update progress bar initial state
        updateReadingProgress();
    }

    // Start reading btn (scrolls down to first chapter or anchor)
    startReadingBtn.addEventListener("click", () => {
        if (chaptersData.length > 0) {
            selectChapter(chaptersData[0].id);
        } else {
            document.getElementById("chapters-anchors").scrollIntoView({ behavior: "smooth" });
        }
    });

    // 5. Reading progress bar handler
    window.addEventListener("scroll", updateReadingProgress);

    function updateReadingProgress() {
        if (!activeChapterId) {
            readingProgress.style.width = "0%";
            return;
        }

        const paneHeight = articlePane.offsetHeight;
        const paneTop = articlePane.offsetTop;
        const scrollPos = window.scrollY;
        const windowHeight = window.innerHeight;

        const distanceScrolled = scrollPos - paneTop;
        const totalScrollableHeight = paneHeight - windowHeight;

        if (totalScrollableHeight <= 0) {
            readingProgress.style.width = "0%";
            return;
        }

        let percentage = (distanceScrolled / totalScrollableHeight) * 100;
        percentage = Math.min(Math.max(percentage, 0), 100); // Constraint between 0 and 100
        readingProgress.style.width = `${percentage}%`;
    }

    // 6. Quick Local Search Engine
    function setupSearchEngine() {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            if (!query) {
                searchResults.innerHTML = "";
                return;
            }

            const matches = [];
            chaptersData.forEach(chapter => {
                const lines = chapter.content.split('\n');
                lines.forEach((line, lineIndex) => {
                    if (line.toLowerCase().includes(query)) {
                        matches.push({
                            chapterId: chapter.id,
                            chapterTitle: chapter.title,
                            snippet: line.trim(),
                            lineIndex: lineIndex
                        });
                    }
                });
            });

            renderSearchResults(matches, query);
        });
    }

    function renderSearchResults(matches, query) {
        searchResults.innerHTML = "";
        
        if (matches.length === 0) {
            searchResults.innerHTML = `<p class="placeholder-text" style="padding: 20px;">'${query}'에 대한 검색 결과가 없습니다.</p>`;
            return;
        }

        // Limit results to 20 for search aesthetics
        const displayedMatches = matches.slice(0, 20);

        displayedMatches.forEach(match => {
            const item = document.createElement("div");
            item.classList.add("search-item");
            
            const title = document.createElement("span");
            title.classList.add("search-item-title");
            title.innerText = match.chapterTitle;

            const snippet = document.createElement("span");
            snippet.classList.add("search-item-snippet");
            // Highlight query in the snippet
            const regex = new RegExp(`(${query})`, "gi");
            snippet.innerHTML = match.snippet.replace(regex, "<strong>$1</strong>");

            item.appendChild(title);
            item.appendChild(snippet);

            item.addEventListener("click", () => {
                selectChapter(match.chapterId);
                hideSearch();
            });

            searchResults.appendChild(item);
        });
    }
});

// Helper smooth scroll
function scrollToSection(selector) {
    const el = document.querySelector(selector);
    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}
