function filterCategory(category){
    let cards=document.querySelectorAll(".card");

    cards.forEach(card=>{
        if(category==="all"){
            card.style.display="block";
        }
        else if(card.classList.contains(category)){
            card.style.display="block";
        }
        else{
            card.style.display="none";
        }
    });
}

function searchProduct(){
    let input=document.getElementById("search").value.toLowerCase();
    let cards=document.querySelectorAll(".card");

    cards.forEach(card=>{
        let title=card.querySelector("h3").innerText.toLowerCase();
        if(title.includes(input)){
            card.style.display="block";
        }else{
            card.style.display="none";
        }
    });
}
