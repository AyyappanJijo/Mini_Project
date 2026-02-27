const form = document.getElementById("leaveForm");

if(form){
form.addEventListener("submit", function(e){
e.preventDefault();

let leaves =
JSON.parse(localStorage.getItem("leaves")) || [];

const leave = {
name: document.getElementById("name").value,
type: document.getElementById("leaveType").value,
from: document.getElementById("fromDate").value,
to: document.getElementById("toDate").value,
reason: document.getElementById("reason").value,
status:"Pending"
};

leaves.push(leave);

localStorage.setItem("leaves",
JSON.stringify(leaves));

alert("Leave Applied Successfully");
form.reset();
});
}


/* DASHBOARD */

const table = document.getElementById("leaveTable");

if(table){

let leaves =
JSON.parse(localStorage.getItem("leaves")) || "";

let total=0,pending=0,approved=0;

leaves.forEach((leave,index)=>{

total++;

if(leave.status==="Pending")
pending++;
else
approved++;

table.innerHTML+=`
<tr>
<td>${leave.name}</td>
<td>${leave.type}</td>
<td>${leave.from}</td>
<td>${leave.to}</td>
<td>${leave.status}</td>
<td>
<button class="approve" onclick="approve(${index})">
Approve
</button>

<button class="delete" onclick="removeLeave(${index})">
Delete
</button>
</td>
</tr>
`;
});

document.getElementById("total").innerText=total;
document.getElementById("pending").innerText=pending;
document.getElementById("approved").innerText=approved;
}


function approve(index){

let leaves=
JSON.parse(localStorage.getItem("leaves"));

leaves[index].status="Approved";

localStorage.setItem("leaves",
JSON.stringify(leaves));

location.reload();
}

function removeLeave(index){

let leaves=
JSON.parse(localStorage.getItem("leaves"));

leaves.splice(index,1);

localStorage.setItem("leaves",
JSON.stringify(leaves));

location.reload();
}