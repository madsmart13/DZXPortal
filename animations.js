document.getElementById("captcha-btn").onclick = () => {
    let val = document.getElementById("captcha-input").value.trim();
    if (val.length < 1) return alert("کد امنیتی را وارد کن");

    document.getElementById("captcha-box").style.display = "none";
    document.getElementById("server-panel").style.display = "block";
};

let selected = null;

function selectServer(n) {
    selected = n;
    alert("سرور " + n + " انتخاب شد");
}

document.getElementById("connect-btn").onclick = () => {
    if (!selected) return alert("یک سرور انتخاب کن");

    document.getElementById("server-panel").style.display = "none";
    document.getElementById("loading-screen").style.display = "block";

    setTimeout(() => {
        document.getElementById("loading-screen").style.display = "none";
        document.getElementById("error-box").style.display = "block";
    }, 4000);
};
