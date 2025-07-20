const USERNAME = "admin";
const PASSWORD = "1234"; // static login

const menus = ["menu1", "menu2", "menu3", "menu4", "menu5"];
const REPO_OWNER = "The-Oterra";
const REPO_NAME = "MenuQRCode";

function login(event) {
  event.preventDefault(); // ✅ Prevents form reload

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

function loadMenuUI() {
  const container = document.getElementById("menu-container");

  menus.forEach(menu => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://theoterra.netlify.app/images/${menu}.jpg`;
    const div = document.createElement("div");
    div.className = "menu-block";

    div.innerHTML = `
      <h3>${menu}</h3>
      <img src="images/${menu}.jpg" alt="${menu}" width="150" onerror="this.style.display='none'" />
      <br/>
      <input type="file" accept="image/*" onchange="uploadImage(event, '${menu}')">
      <br/>
      <a href="${qrUrl}" target="_blank">Generate QR</a> |
      <a href="#" onclick="downloadQRCode('${menu}', '${qrUrl}'); return false;">Download QR</a>
    `;

    container.appendChild(div);
  });
}

async function uploadImage(event, menuName) {
  const file = event.target.files[0];
  if (!file) return alert("No file selected");

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64 = reader.result.split(",")[1];

    const payload = {
      repoOwner: REPO_OWNER,
      repoName: REPO_NAME,
      imagePath: `images/${menuName}.jpg`,
      base64Content: base64,
      commitMessage: `Update ${menuName}.jpg via dashboard`
    };

    const res = await fetch("/.netlify/functions/update-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      alert(`✅ ${menuName}.jpg uploaded Sucessfully! Wait 30 Seconds to Get Updated`);
      setTimeout(() => location.reload(), 3000); // reload to show updated image
    } else {
      console.error(data);
      alert(`❌ Failed to update ${menuName}.jpg`);
    }
  };

  reader.readAsDataURL(file);
}

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

