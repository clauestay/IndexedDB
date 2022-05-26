let DB;

// selectores de la interfazione
const form = document.querySelector('form'),
    nombreMascota = document.querySelector('#mascota'),
    nombreCliente = document.querySelector('#cliente'),
    telefono = document.querySelector('#telefono'),
    fecha = document.querySelector('#fecha'),
    hora = document.querySelector('#hora'),
    sintomas = document.querySelector('#sintomas'),
    citas = document.querySelector('#citas'),
    headingAdministra = document.querySelector('#administra');

    // esperar a que el DOM este listo
    document.addEventListener('DOMContentLoaded', () => {
        // crear la base de datos
        let crearDB = window.indexedDB.open('citas', 1);

        // si hay un error en la creacion de la base de datos
        crearDB.onerror = function() {
            console.log('Hubo un error');
        }

        // si la base de datos se crea correctamente
        crearDB.onsuccess = function() {
            // guardar la base de datos en una variable
            DB = crearDB.result;
            console.log('Base de datos creada');

            mostrarCitas();
        }

        // este metodo solo se ejecuta una vez y crea el esquema de la bd
        crearDB.onupgradeneeded = function(e) {
            let db = e.target.result;
            console.log('Solo una vez');

            // crear un object store
            let objectStore = db.createObjectStore('citas', {keyPath: 'key', autoIncrement: true});

            // crear indices y campos de la bd
            objectStore.createIndex('mascota', 'mascota', {unique: false});
            objectStore.createIndex('cliente', 'cliente', {unique: false});
            objectStore.createIndex('telefono', 'telefono', {unique: false});
            objectStore.createIndex('fecha', 'fecha', {unique: false});
            objectStore.createIndex('hora', 'hora', {unique: false});
            objectStore.createIndex('sintomas', 'sintomas', {unique: false});
            console.log('Esquema creado');

        }

        // cuando el formulario es enviado
        form.addEventListener('submit', agregarDatos);

        function agregarDatos(e) {
            e.preventDefault();

            const nuevaCita = {
                mascota: nombreMascota.value,
                cliente: nombreCliente.value,
                telefono: telefono.value,
                fecha: fecha.value,
                hora: hora.value,
                sintomas: sintomas.value
            };

            // transaction para agregar datos
            let transaction = DB.transaction(['citas'], 'readwrite');
            let objectStore = transaction.objectStore('citas');

            let peticion = objectStore.add(nuevaCita);
            
            peticion.onsuccess = () => {
                form.reset();
            }

            transaction.oncomplete = () => {
                console.log("Cita agregada");
                mostrarCitas();
            }

            transaction.onerror = () => {
                console.log("Hubo un error");
            }

        }

        function mostrarCitas() {
            // limpiar citas anteriores
            while(citas.firstChild){
                citas.removeChild(citas.firstChild);
            }

            // crear un objectStore
            let objectStore = DB.transaction('citas').objectStore('citas');

            // retorna una peticon 
            objectStore.openCursor().onsuccess = function(e) {
                // guardar el cursor en una variable
                let cursor = e.target.result;

                if(cursor) {
                    let cita = document.createElement('li');
                    cita.setAttribute('data-cita-id', cursor.value.key);
                    cita.innerHTML = `
                        <p class="list-item">
                            <span class="bold">Nombre Mascota: </span> ${cursor.value.mascota}
                        </p>
                        <p class="list-item">
                            <span class="bold">Nombre Cliente: </span> ${cursor.value.cliente}
                        </p>
                        <p class="list-item">
                            <span class="bold">Telefono: </span> ${cursor.value.telefono}
                        </p>
                        <p class="list-item">
                            <span class="bold">Fecha: </span> ${cursor.value.fecha}
                        </p>
                        <p class="list-item">
                            <span class="bold">Hora: </span> ${cursor.value.hora}
                        </p>
                        <p class="list-item">
                            <span class="bold">Sintomas: </span> ${cursor.value.sintomas}
                        </p>
                        <button type="button" class="btn btn-danger btn-delete">Eliminar</button>
                    `;

                    // agregar el evento del boton
                    cita.querySelector('.btn-delete').addEventListener('click', eliminarCita);

                    citas.appendChild(cita);
                    cursor.continue();
                } else {
                    if(!citas.firstChild) {
                        headingAdministra.textContent = 'Agrega una cita';
                        let info = document.createElement('p');
                        info.classList.add('list-item');
                        info.innerHTML = 'No hay citas';
                        citas.appendChild(info);
                    }else{
                        headingAdministra.textContent = 'Administra tus citas';
                    }
                }
            }
        }

        function eliminarCita(e) {
            // obtener el id de la cita
            let citaId = Number(e.target.parentElement.getAttribute('data-cita-id'));

            // transaction para eliminar datos
            let transaction = DB.transaction(['citas'], 'readwrite');
            let objectStore = transaction.objectStore('citas');

            // eliminar el dato
            let peticion = objectStore.delete(citaId);

            peticion.onsuccess = () => {
                console.log('Cita eliminada');
                mostrarCitas();
            }

            transaction.oncomplete = () => {
                e.parentElement.parentElement.removeChild(e.target.parentElement);
                console.log(`Cita eliminada : ${citaId}`);

                if(!citas.firstChild) {
                    headingAdministra.textContent = 'Agrega una cita';
                    let info = document.createElement('p');
                    info.classList.add('list-item');
                    info.innerHTML = 'No hay citas';
                    citas.appendChild(info);
                }else{
                    headingAdministra.textContent = 'Administra tus citas';
                }

            }

            transaction.onerror = () => {
                console.log('Hubo un error');
            }
        }

    });