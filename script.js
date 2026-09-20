const API_BASE_URL = "https://vm.yash12007.com";

(function() {
    const AUTH_URL = "https://auth.yash12007.com?origin=https://www.yash12007.com&redirect=https://www.yash12007.com";
    const authContainer = document.getElementById('authActions');
    const STORAGE_KEY = 'yash12007_auth_user';
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    const email = params.get('email');
    const provider = params.get('provider') || 'email/passkey';
    if (email && (status === 'authenticated' || status === 'success')) {
        const usernamePrefix = email.split('@')[0];
        const displayName = usernamePrefix.charAt(0).toUpperCase() + usernamePrefix.slice(1);
        const sessionData = {
            email: email,
            name: displayName,
            provider: provider,
            authenticatedAt: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
        const cleanUrl = window.location.origin + window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
    }
    const rawSession = localStorage.getItem(STORAGE_KEY);
    if (rawSession) {
        try {
            const user = JSON.parse(rawSession);
            renderUserProfile(user);
        } catch (e) {
            console.error("Session parse failed:", e);
            renderDefaultNav();
        }
    } else {renderDefaultNav();}
    function renderUserProfile(user) {
        const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
        authContainer.innerHTML = `
            <div class="profile-container">
                <button class="profile-btn" id="profileToggle" aria-haspopup="true" aria-expanded="false">
                    <div class="profile-avatar">${initial}</div>
                    <span class="profile-name">${user.name || 'Developer'}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                </button>
                <div class="profile-dropdown" id="profileMenu">
                    <div class="dropdown-header">
                        <div style="font-weight: 600; font-size: 0.9rem; color: #fff;">${user.name}</div>
                        <div class="user-email" title="${user.email}">${user.email}</div>
                    </div>
                    <a href="https://paradise.yash12007.com" class="dropdown-item">Developer Console</a>
                    <a href="https://auth.yash12007.com/" class="dropdown-item">Account Settings</a>
                    <a href="#" class="dropdown-item sign-out" id="logoutBtn">Sign Out</a>
                </div>
            </div>
        `;
        const toggleBtn = document.getElementById('profileToggle');
        const menu = document.getElementById('profileMenu');
        const logoutBtn = document.getElementById('logoutBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = menu.classList.toggle('active');
                toggleBtn.setAttribute('aria-expanded', isOpen);
            });
        }
        document.addEventListener('click', (e) => {
            if (!authContainer.contains(e.target) && menu) {
                menu.classList.remove('active');
                if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
            }
        });
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem(STORAGE_KEY);
                window.location.reload();
            });
        }
    }
    function renderDefaultNav() {
        authContainer.innerHTML = `
            <a href="${AUTH_URL}" class="btn btn-secondary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Login</a>
            <a href="${AUTH_URL}" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;">Sign up</a>
        `;
    }
})();

function getUser(){
    const rawSession = localStorage.getItem('yash12007_auth_user');
    if (rawSession) {
        try {
            return JSON.parse(rawSession);
        }catch(err){
            return null;
        }
    }
    return null;
}

function greetUser() {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
        return "Good Morning";
    } else if (currentHour >= 12 && currentHour < 18) {
        return "Good Afternoon";
    } else {
        return "Good Evening";
    }
}

const user = getUser();
document.getElementById("greetings").innerText = `${greetUser()}!`;

let currentActiveProject = null;

// Render request form or login prompt
if(user != null){
    document.getElementById("suggestActionHome").innerHTML = `
        <p>Describe your software needs. Our autonomous system will draft your architecture and compile a sandbox prototype.</p>
        <form id="projectRequestForm">
            <label for="projectDesc">Project Specifications & Features</label>
            <textarea id="projectDesc" name="projectDesc" required placeholder="Describe target platform (Linux binary, CLI tool, API), core UI components, business logic, and behavior..."></textarea>
            <button type="submit" id="submitBtn">Generate Prototype & Estimate</button>
        </form>
        <div id="projectResponseArea"></div>
    `;

    document.getElementById("projectRequestForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        const btn = document.getElementById("submitBtn");
        const textarea = document.getElementById("projectDesc");
        const responseArea = document.getElementById("projectResponseArea");

        btn.disabled = true;
        btn.innerText = "Synthesizing Architecture with AI...";
        responseArea.innerHTML = "";

        try {
            const response = await fetch(`${API_BASE_URL}/api/estimate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description: textarea.value,
                    userEmail: user.email,
                    userName: user.name || "Developer"
                })
            });

            if (!response.ok) throw new Error(`Server returned status: ${response.status}`);

            const data = await response.json();
            currentActiveProject = data;
            renderProjectEstimate(data);

        } catch (error) {
            console.error("Submission failed:", error);
            responseArea.innerHTML = `
                <div style="color: #c00; margin-top: 15px; text-align: center;">
                    Failed to generate estimate from <code>vm.yash12007.com</code>. Check server status and credentials.
                </div>
            `;
        } finally {
            btn.disabled = false;
            btn.innerText = "Generate Prototype & Estimate";
        }
    });

} else {
    document.getElementById("suggestActionHome").textContent = "Login or signup to continue...";
}

// Render card with prototype previewer, revision inputs, build triggers, and PayPal
function renderProjectEstimate(data) {
    const container = document.getElementById("projectResponseArea");
    const isReadyToDownload = Boolean(data.isReady);
    const freeRevs = data.freeRevisionsRemaining !== undefined ? data.freeRevisionsRemaining : 3;

    container.innerHTML = `
        <div class="estimate-card">
            <span class="status-badge ${isReadyToDownload ? 'status-ready' : 'status-building'}">
                ${isReadyToDownload ? 'Build Ready For Download' : 'Prototype Generated'}
            </span>
            <h3 style="margin-top: 0;">Project ID: #${data.projectId}</h3>
            <p style="color: #555; font-size: 0.95rem;">${data.summary || 'Custom Software Solution'}</p>
            
            <div>Estimated Total Cost:</div>
            <div class="estimate-price">$${Number(data.estimatedCost || 0).toFixed(2)} USD</div>
            <p style="font-size: 0.85rem; color: #777; margin: 4px 0 15px 0;">Turnaround: <b>${data.estimatedTime || '3-5 Business Days'}</b></p>
            
            <button class="btn btn-primary" onclick="openPrototypeModal('${data.prototypeUrl || (API_BASE_URL + '/api/prototype/' + data.projectId)}')">
                Launch Testing Prototype (Sandboxed UI)
            </button>

            <div class="revision-box">
                <label for="revisionDesc"><b>Request Modifications & Revisions:</b></label>
                <textarea id="revisionDesc" placeholder="Need to adjust UI colors, buttons, forms, or behavior? Describe changes here..." style="height: 80px; margin-top: 8px;"></textarea>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                    <span style="font-size: 0.85rem; color: ${freeRevs > 0 ? '#155724' : '#856404'};">
                        <b>${freeRevs}</b> Free Revisions Remaining ${freeRevs === 0 ? '(Additional Revisions: $15)' : ''}
                    </span>
                    <button class="btn" id="revBtn" onclick="submitRevision('${data.projectId}')">Apply Revision</button>
                </div>
            </div>

            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">

            <div id="actionContainer">
                ${isReadyToDownload 
                    ? `<p style="font-weight: 600; color: #222;">Binary compiled on OCI VM. Complete checkout via PayPal to download the native package.</p>
                        <div id="paypal-button-container" style="margin-top: 15px;"></div>`
                    : `<p style="color: #666; font-size: 0.9rem;">Satisfied with the UI prototype? Trigger compiler execution on our OCI host.</p>
                        <button class="btn btn-primary" style="width: 100%; height: 48px;" onclick="triggerFullBuild('${data.projectId}')">Approve & Compile Native Executable</button>`
                }
            </div>
        </div>
    `;

    if (isReadyToDownload && window.paypal) {
        renderPayPal(data);
    }
}

// Prototype Modal Controls
function openPrototypeModal(url) {
    const modal = document.getElementById("prototypeModal");
    const frame = document.getElementById("prototypeFrame");
    frame.src = url;
    modal.style.display = "flex";
    setTimeout(()=>{if(confirm("Is the UI visible? if not please let us know by confirming this message else ignore it") == true){
        window.open(url, '_blank');
    }}, 3000);
}

function closePrototypeModal() {
    const modal = document.getElementById("prototypeModal");
    const frame = document.getElementById("prototypeFrame");
    frame.src = "about:blank";
    modal.style.display = "none";
}
async function submitRevision(projectId) {
    const revInput = document.getElementById("revisionDesc");
    const revBtn = document.getElementById("revBtn");
    const text = revInput.value.trim();

    if (!text) return alert("Please specify what modifications are needed.");

    revBtn.disabled = true;
    revBtn.innerText = "Applying changes...";

    try {
        const res = await fetch(`${API_BASE_URL}/api/revise`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId, revisionPrompt: text })
        });

        const result = await res.json();

        if (res.status === 402) {
            alert(result.message);
            renderRevisionPayment(projectId, result.fee);
            return;
        }

        if (!res.ok) throw new Error(result.error || "Revision generation failed");

        alert("Prototype updated successfully!");
        currentActiveProject.freeRevisionsRemaining = result.freeRevisionsRemaining;
        renderProjectEstimate(currentActiveProject);
        openPrototypeModal(result.prototypeUrl);

    } catch (err) {
        alert("Revision error: " + err.message);
    } finally {
        revBtn.disabled = false;
        revBtn.innerText = "Apply Revision";
    }
}

// Trigger native compiler packaging on OCI VM
async function triggerFullBuild(projectId) {
    if (!confirm("Are you satisfied with the prototype? This will trigger the compiler on our OCI VM.")) return;

    const actionContainer = document.getElementById("actionContainer");
    actionContainer.innerHTML = `<p style="color: #a0f; font-weight: 600;">Compiling native binaries with 'pkg' on Oracle OCI VM... This takes ~30-45s.</p>`;

    try {
        const res = await fetch(`${API_BASE_URL}/api/build-final`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Compilation failed.");

        currentActiveProject.isReady = true;
        currentActiveProject.downloadUrl = data.downloadUrl;
        renderProjectEstimate(currentActiveProject);

    } catch (err) {
        alert("Build error: " + err.message);
        renderProjectEstimate(currentActiveProject);
    }
}

// Render Revision Payment button if quota is exhausted
function renderRevisionPayment(projectId, fee) {
    const actionContainer = document.getElementById("actionContainer");
    actionContainer.innerHTML = `
        <div style="background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 8px;">
            <p style="color: #856404; margin: 0 0 10px 0;"><b>Free revision limit reached.</b> Please pay $${fee} USD to unlock the next revision cycle.</p>
            <div id="paypal-revision-container"></div>
        </div>
    `;

    paypal.Buttons({
        createOrder: async () => {
            const res = await fetch(`${API_BASE_URL}/api/paypal/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId, type: "revision" })
            });
            const order = await res.json();
            return order.id;
        },
        onApprove: async (data) => {
            const res = await fetch(`${API_BASE_URL}/api/paypal/capture-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: data.orderID, projectId, type: "revision" })
            });
            const capture = await res.json();
            if (capture.status === "COMPLETED") {
                alert("Revision fee verified! You may now submit your changes.");
                renderProjectEstimate(currentActiveProject);
            }
        }
    }).render('#paypal-revision-container');
}

// Mount PayPal Button for final release download
function renderPayPal(data) {
    paypal.Buttons({
        createOrder: async function() {
            const res = await fetch(`${API_BASE_URL}/api/paypal/create-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: data.projectId,
                    amount: data.estimatedCost,
                    type: "software",
                    currency: "USD",
                    userEmail: user.email
                })
            });
            const orderData = await res.json();
            return orderData.id;
        },
        onApprove: async function(paypalData) {
            const res = await fetch(`${API_BASE_URL}/api/paypal/capture-order`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId: paypalData.orderID,
                    projectId: data.projectId,
                    type: "software"
                })
            });
            const captureDetails = await res.json();
            
            if (captureDetails.status === "COMPLETED" || res.ok) {
                document.getElementById("actionContainer").innerHTML = `
                    <div style="text-align: center; color: #155724; background: #d4edda; padding: 15px; border-radius: 8px;">
                        <b>Payment Successful!</b>
                        <p style="margin: 8px 0;">Your software package has been verified and released.</p>
                        <a href="${captureDetails.downloadUrl || data.downloadUrl || '#'}" class="btn btn-primary" style="display: inline-block; margin-top: 10px;">Download Native Executable (.ZIP)</a>
                    </div>
                `;
            } else {
                alert("Payment capture was unsuccessful. Please check your transaction.");
            }
        },
        onError: function(err) {
            console.error("PayPal Checkout Error:", err);
            alert("An error occurred with PayPal. Please try again.");
        }
    }).render('#paypal-button-container');
}

// Slider toggle & responsive controls
const slider = document.getElementById("slider");
const mainContent = document.querySelector("main");
const icon = document.getElementById("collapseIcon");
const label = document.getElementById("collapseLabel");

function CollapseSlider() { 
    if (!slider || !mainContent) return;
    if (window.innerWidth < 925) {
        slider.classList.add("collapsed");
        mainContent.classList.add("expanded");
        if (icon) icon.style.transform = "rotate(180deg)";
        if (label) label.textContent = "Expand";
        alert("Sidebar cannot be expanded on small screens. Please use a display width of at least 925px.");
        return;
    }
    const isCollapsed = slider.classList.toggle("collapsed");
    mainContent.classList.toggle("expanded", isCollapsed);
    if (icon) { icon.style.transform = isCollapsed ? "rotate(180deg)" : "rotate(0deg)"; }
    if (label) { label.textContent = isCollapsed ? "Expand" : "Collapse"; }
}

if (window.innerWidth < 925) {
    slider.classList.add("collapsed");
    mainContent.classList.add("expanded");
    if (icon) icon.style.transform = "rotate(180deg)";
    if (label) label.textContent = "Expand";
}

function account(){
    if(user != null){
        const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
        document.getElementById('main').innerHTML=`
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 10px;">
                <div style="width: 80px; height: 80px; border-radius: 50%; background: #a0f; color: #fff; font-size: 2rem; display: flex; align-items: center; justify-content: center; font-weight: bold;">${initial}</div>
                <h2>Welcome, ${user.name || 'Developer'}!</h2>
                <p style="color: #666;">${user.email}</p>
            </div>
        `;
    }else{
        alert('Login or Signup to continue...');
    }
}