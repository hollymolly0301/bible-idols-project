const fs = require('fs');
const path = require('path');

const bookDir = path.join(__dirname, '..', 'Book');
const websiteDir = path.join(__dirname);

// Chapter 파일만 필터링하여 정렬
const files = fs.readdirSync(bookDir)
    .filter(f => f.startsWith('Chapter') && f.endsWith('.md'))
    .sort();

const data = [];
files.forEach((file, index) => {
    const content = fs.readFileSync(path.join(bookDir, file), 'utf-8');
    // 첫 번째 줄을 타이틀로 추출 (# 제거)
    const title = content.split('\n')[0].replace('# ', '').replace('[성인 대상 심층 리포트] ', '').replace('[중학생 대상 스토리텔링 리포트] ', '').trim() || `Chapter ${index + 1}`;
    
    data.push({
        id: `chap${index + 1}`,
        title: title,
        content: content
    });
});

const jsContent = "const chaptersData = " + JSON.stringify(data, null, 2) + ";";
fs.writeFileSync(path.join(websiteDir, 'data.js'), jsContent, 'utf-8');
console.log('data.js generated successfully.');
