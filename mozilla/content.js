const regex = /github\.com\/(.*\w+)$/

main()

function main() {
    const href = location.href
    if ((m = regex.exec(href)) !== null) {
        if (m.length === 2) {
            const repoPath = m[1]
            const about = getAbout()
            const repoInfo = getDescription()
            let data = []
            if (about) {
                data.push(about)
            }
            if (repoInfo) {
                data = data.concat(repoInfo)
            }
            let description = data.join(' ')
            if (data.length && description.length > 100) {
                requestSimilarRepo({
                    url: repoPath,
                    description: data.join(' ')
                }).then(result => result.json())
                    .then(result => addSimilarRepo(result))
                    .catch(e => console.error(e))
            }
        }
    }
}

function addSimilarRepo(repos) {
    if (document.getElementsByClassName('p-idx-storm').length !== 0) { return }
    const style = document.createElement('style');
    style.innerHTML = '.p-idx-storm { padding: 12px; }';
    document.getElementsByTagName('head')[0].appendChild(style);
    let inject = ''
    for (const repo of repos.slice(0, 5)) {
        const card = `<div class="Box p-idx-storm mt-2">
    <div>
        <div class="f4 lh-condensed text-bold color-fg-default">
            <a class="Link--primary text-bold no-underline wb-break-all d-inline-block"
               href="${repo.url}">${repo.title}</a>
        </div>
        <div class="dashboard-break-word color-fg-muted mt-1 repo-description">
            <p>${repo.about ?? ""}</p>
        </div>
        <p class="f6 color-fg-muted mt-2 mb-0">
            <span class="d-inline-block mr-3">
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16"
                     data-view-component="true" class="octicon octicon-star mr-1">
    <path fill-rule="evenodd"
          d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"></path>
</svg>
                    ${repo.stars}
            </span>
        </p>
    </div>
</div>
`
        inject += card
    }
    let template = `<div class="BorderGrid-row"><div class="BorderGrid-cell"><h2 class="h4 mb-1">Similar repositories</h2>
<p class="text color-fg-muted mb-2">Provided by <a href="https://indexstorm.com/" target="_blank">indexStorm</a></p>` + inject + `</div></div>`;
    const fragment = document.createRange().createContextualFragment(template);
    const borderGrid = document.querySelector('.BorderGrid');
    if (borderGrid.children.length <= 1) {
        borderGrid.appendChild(fragment.firstChild)
    } else {
        borderGrid.insertBefore(fragment.firstChild, borderGrid.children[1])
    }
}

function getAbout() {
    const sel = document.querySelector("#repo-content-pjax-container > div > div > div.Layout.Layout--flowRow-until-md.Layout--sidebarPosition-end.Layout--sidebarPosition-flowRow-end > div.Layout-sidebar > div > div.BorderGrid-row.hide-sm.hide-md > div > p")
    if (sel) {
        return sel.innerText
    }
}

function getDescription() {
    const result = []
    const article = document.querySelector("#readme > div.Box-body.px-5.pb-5 > article")
    if (!article) {
        return undefined
    }
    for (const child of article.children) {
        if (child.tagName !== 'P') continue;
        const text = child.innerText.trim()
        if (text.length) {
            result.push(text)
        }
    }
    return result.slice(0, 5)
}

async function requestSimilarRepo(body) {
    return fetch('https://git.indexstorm.com/similar', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
}

browser.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.message === 'url changed') {
            main()
        }
    });