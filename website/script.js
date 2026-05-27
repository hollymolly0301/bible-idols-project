document.addEventListener("DOMContentLoaded", () => {
    const navList = document.getElementById("navList");
    const articleContainer = document.getElementById("articleContainer");
    const mobileNavToggle = document.getElementById("mobileNavToggle");
    const sidebar = document.getElementById("sidebar");

    // 모바일 네비게이션 토글
    mobileNavToggle.addEventListener("click", () => {
        sidebar.classList.toggle("show");
    });

    // data.js가 성공적으로 로드되었는지 확인
    if (typeof chaptersData !== 'undefined') {
        renderNavigation();
    } else {
        articleContainer.innerHTML = `<div class="intro-placeholder"><p>데이터를 불러오지 못했습니다. 터미널에서 'node generate_data.js'를 실행했는지 확인해주세요.</p></div>`;
    }

    function renderNavigation() {
        chaptersData.forEach((chapter, index) => {
            const li = document.createElement("li");
            li.classList.add("nav-item");
            
            const btn = document.createElement("button");
            btn.classList.add("nav-btn");
            // 제목을 짧게 가공 (예: "Chapter 1: 족장 시대 ~ 가나안 정착기" -> "Ch.1 족장 시대")
            let shortTitle = chapter.title.split(' (')[0]; 
            shortTitle = shortTitle.replace('Chapter ', 'Ch.');
            shortTitle = shortTitle.split(' ~')[0]; // ~ 앞부분만 유지
            btn.innerText = shortTitle;
            
            btn.addEventListener("click", () => {
                document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                renderContent(chapter.content);
                
                // 모바일에서 클릭 시 사이드바 숨김
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove("show");
                }
            });

            li.appendChild(btn);
            navList.appendChild(li);
        });
    }

    function renderContent(markdownText) {
        // 창 상단으로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // marked.js 라이브러리를 통해 마크다운 파싱
        if (typeof marked !== 'undefined') {
            const htmlContent = marked.parse(markdownText);
            articleContainer.innerHTML = `<div class="markdown-body">${htmlContent}</div>`;
        } else {
            // fallback (라이브러리 로드 실패시)
            articleContainer.innerHTML = `<div class="intro-placeholder"><p>Marked.js 라이브러리를 로드하지 못했습니다.</p></div>`;
        }
    }
});
