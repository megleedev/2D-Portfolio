export function displayDialog (text, onDisplayEnd) {
    const dialogUI = document.getElementById("textbox-container");
    const dialog = document.getElementById("dialog");

    dialogUI.style.display = "block";

    // Text scrolling
    let index = 0;
    let currentText = "";

    const intervalRef = setInterval(() => {
        if (index < text.length) {
            currentText += text[index];
            dialog.innerHTML = currentText;
            index++;
            return;
        }

        clearInterval(intervalRef);
    }, 5);

    // Close button functionality
    const closeButton = document.getElementById("close-button");

    function onCloseBtnClick() {
        onDisplayEnd();
        dialogUI.style.display = "none";
        dialog.innerHTML = "";
        clearInterval(intervalRef);
        closeButton.removeEventListener("click", onCloseBtnClick);
    }

    closeButton.addEventListener("click", onCloseBtnClick);
}