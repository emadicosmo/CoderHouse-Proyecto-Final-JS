//Declaracion de Variables
let listaProductos = [];

//Carga de productos preexistentes en la pagina
window.addEventListener('load', () => {
    cargarProductos();
});

// Función para agregar un producto al arreglo y almacenarlo en localStorage
let btnAgregarProducto = document.getElementById("formularioStock");

btnAgregarProducto.addEventListener("submit", function (evento) {
    evento.preventDefault();

    let marca = document.getElementById("marca").value;
    let modelo = document.getElementById("modelo").value;
    let tipo = document.getElementById("tipo").value;
    let cantidad = parseInt(document.getElementById("cantidad").value);

    if (!marca || !modelo || !tipo || isNaN(cantidad) || cantidad <= 0) {
        Toastify({
            text: "Complete los campos requeridos",
            duration: 2000,
            gravity: "top",
            position: "left",
            style: {
                fontSize: "20px",
                fontFamily: "'Roboto Mono', monospace",
                className: "info",
                background: "#574949"
            }
        }).showToast();

        document.getElementById("marca").value = "";
        document.getElementById("modelo").value = "";
        document.getElementById("tipo").value = "";
        document.getElementById("cantidad").value = "";

    } else {

        let productoExistente = listaProductos.find(producto => producto.modelo == modelo);
        let productoExistentePorTipo = listaProductos.find(producto => producto.tipo == tipo);

        if (productoExistente && productoExistentePorTipo) {

            productoExistente.cantidad += cantidad;

        } else {

            let producto = { marca, modelo, tipo, cantidad };
            listaProductos.push(producto);
        }

        localStorage.setItem("producto", JSON.stringify(listaProductos));

        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Producto agregado',
            showConfirmButton: false,
            timer: 1500
        })

        document.getElementById("marca").value = "";
        document.getElementById("modelo").value = "";
        document.getElementById("tipo").value = "";
        document.getElementById("cantidad").value = "";

        mostrarProductosEnTabla();
    }
});


//Visualizacion de datos

function cargarProductos() {
    // al no utilizar API cargamos datos estaticos desde un archivo JSON
    fetch('JSON/productos.json')
        .then(response => response.json())
        .then(data => {

            listaProductos = data;
            localStorage.setItem("producto", JSON.stringify(listaProductos));

            mostrarProductosEnTabla();
            configurarFiltroTipo()
        })
        .catch(error => {
            Toastify({
                text: "Error al cargar datos preexistentes",
                duration: 2000,
                gravity: "top",
                position: "left",
                style: {
                    fontSize: "20px",
                    fontFamily: "'Roboto Mono', monospace",
                    className: "info",
                    background: "#3E606F"
                }
            }).showToast();
        });
}

function mostrarProductosEnTabla() {
    let tabla = document.getElementById("tablaProductos");
    let tbody = tabla.querySelector("tbody");
    tbody.innerHTML = "";

    for (let producto of listaProductos) {
        let fila = document.createElement("tr");
        fila.innerHTML = `<td>${producto.marca}</td>
                          <td>${producto.modelo}</td>
                          <td>${producto.tipo}</td>
                          <td>${producto.cantidad}</td>
                          <td><button class="btn btnRetirar" data-modelo="${producto.modelo}"><span class="material-symbols-outlined">remove_circle_outline</span></button></td>`;
        tbody.appendChild(fila);
    }

    let btnRetirarArray = document.querySelectorAll(".btnRetirar");
    btnRetirarArray.forEach(btn => {
        btn.addEventListener("click", () => {
            let modeloARetirar = btn.getAttribute("data-modelo");
            solicitarCantidadARetirar(modeloARetirar);
        });
    });

}

//Filtro de productos

function filtrarProductosPorTipo(tipo) {
    let tabla = document.getElementById("tablaProductos");
    let filas = tabla.querySelectorAll("tbody tr");

    filas.forEach((fila) => {
        let tipoProducto = fila.querySelector("td:nth-child(3)").textContent;
        if (tipo == "" || tipoProducto == tipo) {
            fila.style.display = "";
        } else {
            fila.style.display = "none";
        }
    });
}

let filtroTipo = document.getElementById("filtroTipo");

filtroTipo.addEventListener("change", () => {
    let tipoSeleccionado = filtroTipo.value;
    filtrarProductosPorTipo(tipoSeleccionado);
});

function configurarFiltroTipo() {
    let tabla = document.getElementById("tablaProductos");
    let filas = tabla.querySelectorAll("tbody tr");
    let filtroTipo = document.getElementById("filtroTipo");
    let tiposUnicos = new Set();

    filas.forEach((fila) => {
        let tipoProducto = fila.querySelector("td:nth-child(3)").textContent;
        tiposUnicos.add(tipoProducto);
    });

    filtroTipo.innerHTML = "";

    let optionTodos = document.createElement("option");
    optionTodos.value = "";
    optionTodos.textContent = "Todos";
    filtroTipo.appendChild(optionTodos);

    tiposUnicos.forEach(tipo => {
        let option = document.createElement("option");
        option.value = tipo;
        option.textContent = tipo;
        filtroTipo.appendChild(option);
    });
}



//FUNCION PARA RETIRAR ELEMENTOS DEL STOCK

function solicitarCantidadARetirar(modeloARetirar) {
    Swal.fire({
        title: 'Ingrese la cantidad a retirar',
        input: 'number',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        confirmButtonColor:"#574949",
        showLoaderOnConfirm: true,
        preConfirm: (cantidadARetirar) => {
            retirarElementos(modeloARetirar, parseInt(cantidadARetirar));
        },
    });
}

function retirarElementos(modeloARetirar, cantidadARetirar) {
    let productoExistente = listaProductos.find(producto => producto.modelo == modeloARetirar);

    if (!productoExistente) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'El producto con ese modelo no existe en la lista de productos.',
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }

    if (cantidadARetirar <= 0) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Por favor, ingrese una cantidad válida mayor que cero.',
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }

    if (cantidadARetirar > productoExistente.cantidad) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No puede retirar más elementos de los que hay guardados.',
            showConfirmButton: false,
            timer: 1500
        });
        return;
    }

    productoExistente.cantidad -= cantidadARetirar;

    if (productoExistente.cantidad <= 0) {
        listaProductos = listaProductos.filter(producto => producto.modelo != modeloARetirar);
    }

    localStorage.setItem("producto", JSON.stringify(listaProductos));

    Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Se retiraron los elementos del producto correctamente.',
        showConfirmButton: false,
        timer: 1500
    });

    mostrarProductosEnTabla();
}

