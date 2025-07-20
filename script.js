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
  container.innerHTML = "";

  menus.forEach(menu => {
    const div = document.createElement("div");
    div.className = "menu-block";

    div.innerHTML = `
      <h3>${menu}</h3>
      <label>Select File Type:</label>
      <select id="${menu}-type" onchange="updateMenuUI('${menu}')">
        <option value="image">Image</option>
        <option value="pdf">PDF</option>
      </select>

      <div id="${menu}-preview">
        <img src="images/${menu}.jpg" width="150" onerror="this.style.display='none'"/>
      </div>

      <input type="file" id="${menu}-file" accept="image/*" onchange="uploadFile(event, '${menu}')">

      <br><br>
      <a id="${menu}-qr" href="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://theoterra.netlify.app/images/${menu}.jpg" target="_blank">Generate QR</a> |
      <a href="#" onclick="downloadQRCode('${menu}', document.getElementById('${menu}-qr').href); return false;">Download QR</a>
    `;

    container.appendChild(div);
    updateMenuUI(menu); // set initial state
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

  const selectedType = document.getElementById(`${menuName}-type`).value;
  const extension = selectedType === "pdf" ? "pdf" : "jpg";
  const folder = selectedType === "pdf" ? "pdf" : "images";

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
      alert(`✅ ${menuName}.${extension} uploaded! Wait 30 seconds to update.`);
      setTimeout(() => location.reload(), 3000);
    } else {
      console.error(data);
      alert(`❌ Failed to update ${menuName}.${extension}`);
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
