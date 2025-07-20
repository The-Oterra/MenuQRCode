const USERNAME = "admin";
const PASSWORD = "1234";

const menus = ["Menu-1", "Menu-2", "Menu-3", "Menu-4", "Menu-5"];
const REPO_OWNER = "The-Oterra";
const REPO_NAME = "MenuQRCode";

// LOGIN FUNCTION
function login(event) {
  event.preventDefault();
  const u = document.getElementById("username").value;
  const p = document.getElementById("password").value;

  if (u === USERNAME && p === PASSWORD) {
    document.getElementById("login-wrapper").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
    loadMenuUI();
  } else {
    alert("Invalid credentials");
  }
}

// LOAD MENU UI WITH DROPDOWN
function loadMenuUI() {
  const container = document.getElementById("menu-container");
  container.innerHTML = ''; // clear previous

  menus.forEach(menu => {
    const div = document.createElement("div");
    div.className = "menu-block";

    // Create default QR with image type
    const defaultType = "image";
    const path = `https://theoterra.netlify.app/images/${menu}.jpg`;
    const qrDataUrl = path;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataUrl)}`;

    div.innerHTML = `
      <h3>${menu}</h3>

      <!-- Dropdown to choose file type -->
      <label for="type-${menu}">File Type:</label>
      <select id="type-${menu}" onchange="updateQRCode('${menu}')">
        <option value="image">Image</option>
        <option value="pdf">PDF</option>
      </select>

      <!-- Placeholder preview -->
      <img id="preview-${menu}" src="images/${menu}.jpg" alt="${menu}" width="150" onerror="this.style.display='none'" />

      <br/>
      <input type="file" onchange="uploadFile(event, '${menu}')">
      <br/><br/>

      <!-- QR section -->
      <a id="qr-link-${menu}" href="${qrUrl}" target="_blank">Generate QR</a> |
      <a href="#" onclick="downloadQRCode('${menu}', '${qrUrl}'); return false;">Download QR</a>
    `;

    container.appendChild(div);
  });
}


// UPDATE UI WHEN DROPDOWN CHANGES
function updateMenuUI(menu) {
  const selectedType = document.getElementById(`${menu}-type`).value;
  const fileInput = document.getElementById(`${menu}-file`);
  const preview = document.getElementById(`${menu}-preview`);
  const qr = document.getElementById(`${menu}-qr`);

  const folder = selectedType === "pdf" ? "pdf" : "images";
  const extension = selectedType === "pdf" ? "pdf" : "jpg";

  const fileUrl = `https://theoterra.netlify.app/${folder}/${menu}.${extension}`;
  qr.href = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(fileUrl)}`;

  if (selectedType === "image") {
    preview.innerHTML = `<img src="${folder}/${menu}.jpg" width="150" onerror="this.style.display='none'" />`;
    fileInput.accept = "image/*";
  } else {
    preview.innerHTML = `<p>📄 ${menu}.pdf</p>`;
    fileInput.accept = "application/pdf";
  }
}

// UPLOAD TO GITHUB VIA NETLIFY FUNCTION
async function uploadFile(event, menuName) {
  const file = event.target.files[0];
  if (!file) return alert("No file selected");

  const type = document.getElementById(`type-${menuName}`).value;
  const folder = type === "pdf" ? "pdf" : "images";
  const extension = type === "pdf" ? "pdf" : "jpg";

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64 = reader.result.split(",")[1];

    const payload = {
      repoOwner: REPO_OWNER,
      repoName: REPO_NAME,
      imagePath: `${folder}/${menuName}.${extension}`,
      base64Content: base64,
      commitMessage: `Update ${menuName}.${extension} via dashboard`
    };

    const res = await fetch("/.netlify/functions/update-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      alert(`✅ ${menuName}.${extension} uploaded! Wait 30s for update.`);
      setTimeout(() => location.reload(), 3000);
    } else {
      console.error(data);
      alert(`❌ Failed to upload ${menuName}.${extension}`);
    }
  };

  reader.readAsDataURL(file);
}

// QR CODE DOWNLOAD
async function downloadQRCode(menu, qrUrl) {
  try {
    const response = await fetch(qrUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${menu}-qr.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("❌ Failed to download QR code.");
    console.error(err);
  }
}

function updateQRCode(menu) {
  const type = document.getElementById(`type-${menu}`).value;
  let filePath;

  if (type === "image") {
    filePath = `https://theoterra.netlify.app/images/${menu}.jpg`;
    document.getElementById(`preview-${menu}`).src = `images/${menu}.jpg`;
    document.getElementById(`preview-${menu}`).style.display = 'block';
  } else {
    filePath = `https://docs.google.com/gview?embedded=true&url=https://theoterra.netlify.app/pdf/${menu}.pdf`;
    document.getElementById(`preview-${menu}`).style.display = 'none';
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(filePath)}`;
  const qrLink = document.getElementById(`qr-link-${menu}`);
  qrLink.href = qrUrl;
}
