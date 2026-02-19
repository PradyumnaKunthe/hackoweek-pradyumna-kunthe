document.getElementById("eventForm").addEventListener("submit", function(e){
    e.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();

    if(name.length < 3){
        alert("Name must be at least 3 characters");
        return;
    }

    if(phone.length !== 10){
        alert("Enter valid 10 digit phone number");
        return;
    }

    document.getElementById("msg").innerText =
        "🎉 Registration Successful! See you at the event.";

    this.reset();
});
