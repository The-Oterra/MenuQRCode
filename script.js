const pendingUpdates = {};

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
async function loadMenuUI() {
  const container = document.getElementById("menu-container");
  container.innerHTML = '';

  // 1. Load config from remote file
  const cfgRes = await fetch('/.netlify/functions/get-config');
  const config = await cfgRes.json();

  menus.forEach(menu => {
    const menuCfg = config[menu] || { type: "image", status: "enabled" };
    const { type, status } = menuCfg;

    const isEnabled = status === "enabled";

    const filePath =
      type === "pdf"
        ? `https://theoterra.netlify.app/pdf/${menu}.pdf`
        : `https://theoterra.netlify.app/images/${menu}.jpg`;

    const qrDataUrl =
      type === "pdf"
        ? `https://docs.google.com/gview?embedded=true&url=${filePath}`
        : filePath;

    const qrUrl = isEnabled
      ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataUrl)}`
      : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=This QR is disabled`;

    const div = document.createElement("div");
    div.className = "menu-block";

    div.innerHTML = `
  <h3>${menu}</h3>
  <label for="${menu}-type">File Type:</label>
  <select id="${menu}-type" onchange="onTypeChange('${menu}')">
    <option value="image">Image</option>
    <option value="pdf">PDF</option>
  </select>

  <label for="${menu}-status">Status:</label>
  <select id="${menu}-status" onchange="onStatusChange('${menu}')">
    <option value="enabled">Enabled</option>
    <option value="disabled">Disabled</option>
  </select>

  <div id="${menu}-preview"></div>

  <br/>
  <input id="${menu}-file" type="file" onchange="onFileSelect(event, '${menu}')">

  <br/><br/>
  <button onclick="submitMenuUpdate('${menu}')">Submit Changes</button>

  <br/><br/>
  <a id="${menu}-qr" href="#" target="_blank">Generate QR</a> |
  <a href="#" onclick="downloadQRCode('${menu}'); return false;">Download QR</a>
`;

    container.appendChild(div);

    // Set dropdown selected values to config
    document.getElementById(`${menu}-type`).value = type;
    document.getElementById(`${menu}-status`).value = status;

    // Update preview, QR, etc
    updateMenuUI(menu);
  });
}

async function updateConfig(menu, type, status) {
  const payload = {
    repoOwner: REPO_OWNER,
    repoName: REPO_NAME,
    configUpdate: { menu, type, status }
  };

  const res = await fetch("/.netlify/functions/update-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    return await res.json(); // don't reload here!
  } else {
    const err = await res.json();
    throw new Error(err.message || "Update config failed");
  }
}

function onTypeChange(menu) {
  const newType = document.getElementById(`${menu}-type`).value;
  const status = document.getElementById(`${menu}-status`).value;

  if (!pendingUpdates[menu]) pendingUpdates[menu] = {};
  pendingUpdates[menu].type = newType;
  pendingUpdates[menu].status = status;

  updateMenuUI(menu); // update preview & qr based on new selection
}

function onStatusChange(menu) {
  const newStatus = document.getElementById(`${menu}-status`).value;
  const type = document.getElementById(`${menu}-type`).value;

  if (!pendingUpdates[menu]) pendingUpdates[menu] = {};
  pendingUpdates[menu].status = newStatus;
  pendingUpdates[menu].type = type;

  updateMenuUI(menu);
}

function onFileSelect(event, menu) {
  if (!pendingUpdates[menu]) pendingUpdates[menu] = {};
  pendingUpdates[menu].file = event.target.files[0]; // store file object

  // Optionally preview the selected image/pdf file here (if you want)
  // For simplicity, just update preview
  updateMenuUI(menu);
}

// UPDATE UI WHEN DROPDOWN CHANGES
function updateMenuUI(menu) {
  const selectedType = document.getElementById(`${menu}-type`).value;
  const selectedStatus = document.getElementById(`${menu}-status`).value;
  const fileInput = document.getElementById(`${menu}-file`);
  const preview = document.getElementById(`${menu}-preview`);
  const qr = document.getElementById(`${menu}-qr`);

  if (selectedStatus === 'disabled') {
    preview.innerHTML = `<p>⚠️ QR code for ${menu} is disabled</p>`;
    fileInput.style.display = 'none';
    qr.href = '#';
    qr.textContent = 'QR Disabled';
    return;
  } else {
    fileInput.style.display = '';
    qr.textContent = 'Generate QR';
  }

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
async function uploadFileDirect(menu, file, type) {
  const folder = type === "pdf" ? "pdf" : "images";
  const extension = type === "pdf" ? "pdf" : "jpg";

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result.split(",")[1];

      const payload = {
        repoOwner: REPO_OWNER,
        repoName: REPO_NAME,
        imagePath: `${folder}/${menu}.${extension}`,
        base64Content: base64,
        commitMessage: `Update ${menu}.${extension} via dashboard`
      };

      const res = await fetch("/.netlify/functions/update-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        resolve(await res.json());
      } else {
        const err = await res.json();
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
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
  const qrLink = `https://theoterra.netlify.app/menu/${menu}`;
  qr.href = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrLink)}`;

}

async function submitMenuUpdate(menu) {
  if (!pendingUpdates[menu]) {
    alert("No changes to update");
    return;
  }

  // Fallback to dropdown values if not changed
  const type = pendingUpdates[menu].type || document.getElementById(`${menu}-type`).value;
  const status = pendingUpdates[menu].status || document.getElementById(`${menu}-status`).value;
  const file = pendingUpdates[menu].file;

  try {
    if (file) {
      await uploadFileDirect(menu, file, type);
    }

    await updateConfig(menu, type, status);

    alert(`✅ Successfully updated ${menu}`);
    delete pendingUpdates[menu];

    loadMenuUI();
  } catch (err) {
    console.error(err);
    alert(`❌ Failed to update ${menu}: ${err.message || err}`);
  }
}

