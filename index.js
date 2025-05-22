const API_URL = "https://6825ded0397e48c91313f355.mockapi.io/tasks";

const todoInput = document.getElementById("todo-input");
const addButton = document.getElementById("add-button");

document.addEventListener("DOMContentLoaded", getTodos);
addButton.addEventListener("click", addTodo);

// function getTodos() {
//     // Endpoint call API
//     fetch("https://6825ded0397e48c91313f355.mockapi.io/tasks")
//     // chuyển về JSON để có thể đọc được
//     .then((response) =>
//         response.json()
//     )
//     // Lấy dữ liệu
//     .then(data =>
//         console.log(data)
//     )
//     // In ra lỗi nếu có lỗi
//     .catch((err) =>
//         console.log(err)
//     );
// }

// function getTodos(){
//     axios
//     .get("https://6825ded0397e48c91313f355.mockapi.io/tasks")
//     .then((response) => console.log(response.data))
//     .catch((err) => console.log(err))
// }

// Call API gọi là bất đồng bộ vì giữa chừng nó đem qua luồn khác dùng để xử lý dử liệu

// GET FUNCTION
async function getTodos() {
  try {
    const response = await axios.get(API_URL);
    // để có thể xử lý dữ liệu cùng lúc thì buộc phải đồng bộ hàm
    console.log(response.data);
    const ul = document.querySelector(".todo-list");
    ul.innerHTML = "";
    response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort thứ tự xuất hiện của list

    response.data.forEach((item) => {
      //console.log(item.content +" "+ item.id);
      console.log(item);
      //Tạo ra cái thẻ li
      const li = document.createElement("li");
      // Gắn class dzô
      li.className = "todo-item";
      // format day
      const date = new Date(item.createdAt);

      const formatDate = `${date.toLocaleTimeString()} - ${date.toLocaleDateString()}`;

      //Gắn nội dung  dzô
      li.innerHTML = `
                    <div class="todo-content">
                       <input type="checkbox">
                       <div>
                            <span>${item.content}</span>
                            <div>${formatDate}</div>
                       </div>
                    </div>

                    <div class="todo-action">
                        <button onclick="handleUpdate(${item.id}, '${item.content}' )" class="pen"><i 
                            class="fa-solid fa-pen-to-square"></i></button>
                        <button onclick="handleDelete(${item.id})"><i class="fa-solid fa-trash"></i></button>
                    </div>
                `;

      // lấy ra danh sach ul

      ul.appendChild(li);
    });
  } catch (error) {
    console.log(error);
  }
}
//POST FUNCTION
async function addTodo() {
  let inputData = todoInput.value.trim();
  if (!inputData) return;
  const newTodo = {
    createdAt: new Date().toISOString(),
    content: inputData,
    isCompleted: false,
  };
  try {
    // Call API and send data
    const response = await axios.post(API_URL, newTodo);
    todoInput.value = "";
    // Fetch Data
    getTodos();
    // Alert notification
    showNotification("Add todo successfully!");
  } catch (error) {
    console.log(error);
  }

  console.log(response);
}

// PUT FUNCTION
function handleUpdate(id, content) {
  Swal.fire({
    title: "Edit Your Task",
    input: "text",
    inputAttributes: {
      autocapitalize: "off",
    },
    inputValue: content,
    showCancelButton: true,
    confirmButtonText: "Save",
    showLoaderOnConfirm: true,
    preConfirm: async (dataInput) => {
      await axios.put(`${API_URL}/${id}`, {
        content: dataInput,
      });
      getTodos();
      showNotification("Update todo successfully!");
    },
  });
}
//DELETE FUNCTION
function handleDelete(id) {
  console.log(id);
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btn btn-success",
      cancelButton: "btn btn-danger",
    },
    buttonsStyling: false,
  });
  swalWithBootstrapButtons
    .fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        await axios.delete(`${API_URL}/${id}`);
        getTodos();
        showNotification("Delete todo successfully");
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire({
          title: "Cancelled",
          text: "Your imaginary file is safe :)",
          icon: "error",
        });
      }
    });
}

function showNotification(message) {
  Swal.fire({
    title: message,
    width: 600,
    draggable: true,
    padding: "3em",
    color: "#716add",
    background: "#fff url(https://sweetalert2.github.io/images/trees.png)",
    backdrop: `
    rgba(0,0,123,0.4)
    url("https://sweetalert2.github.io/images/nyan-cat.gif")
    left top
    no-repeat
  `,
  });
}
