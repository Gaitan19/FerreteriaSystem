import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  Label,
  Input,
  FormGroup,
  ModalFooter,
  Row,
  Col,
} from "reactstrap";
import Swal from "sweetalert2";
import * as XLSX from 'xlsx';
import printJS from 'print-js';
import { useSignalR } from "../context/SignalRProvider"; // Importa el hook de SignalR

const modeloProveedor = {
  idProveedor: 0,
  nombre: "",
  correo: "",
  telefono: "",
  esActivo: true,
  fechaRegistro: "",
};

const Proveedor = () => {
  const [proveedor, setProveedor] = useState(modeloProveedor);
  const [pendiente, setPendiente] = useState(true);
  const [proveedores, setProveedores] = useState([]);
  const [filteredProveedores, setFilteredProveedores] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [verModal, setVerModal] = useState(false);
  const { subscribe } = useSignalR(); // Obtiene la función subscribe del contexto

  const handleChange = (e) => {
    let value;
    if (e.target.name === "esActivo") {
      value = e.target.value === "true" ? true : false;
    } else {
      value = e.target.value;
    }

    setProveedor({
      ...proveedor,
      [e.target.name]: value,
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (value === "") {
      setFilteredProveedores(proveedores);
    } else {
      const filtered = proveedores.filter((item) =>
        item.nombre.toLowerCase().includes(value) ||
        item.correo.toLowerCase().includes(value) ||
        item.telefono.toLowerCase().includes(value) ||
        (item.esActivo ? "activo" : "no activo").includes(value)
      );
      setFilteredProveedores(filtered);
    }
  };

  const exportToPDF = () => {
    const printData = filteredProveedores.map(prov => ({
      Nombre: prov.nombre,
      Correo: prov.correo,
      Telefono: prov.telefono,
      Estado: prov.esActivo ? "Activo" : "No Activo"
    }));

    printJS({
      printable: printData,
      properties: ['Nombre', 'Correo', 'Telefono', 'Estado'],
      type: 'json',
      gridHeaderStyle: 'color: black; border: 2px solid #3971A5; font-weight: bold;',
      gridStyle: 'border: 2px solid #3971A5; margin-bottom: 20px',
      documentTitle: 'Lista de Proveedores',
      header: 'Lista de Proveedores'
    });
  };

  const exportToExcel = () => {
    const excelData = filteredProveedores.map(prov => ({
      'Nombre': prov.nombre,
      'Correo': prov.correo,
      'Teléfono': prov.telefono,
      'Fecha Registro': prov.fechaRegistro,
      'Estado': prov.esActivo ? 'Activo' : 'No Activo',
      'ID': prov.idProveedor
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
    XLSX.writeFile(wb, 'proveedores.xlsx');
  };

  const obtenerProveedores = async () => {
    try {
      let response = await fetch("api/proveedor/Lista");
      if (response.ok) {
        let data = await response.json();
        setProveedores(data);
        setFilteredProveedores(data);
        setPendiente(false);
      }
    } catch (error) {
      console.error("Error obteniendo proveedores:", error);
      setPendiente(false);
    }
  };

  useEffect(() => {
    obtenerProveedores();

    // Configurar suscripciones a eventos de SignalR
    const unsubscribeCreated = subscribe('ProveedorCreated', (nuevoProveedor) => {
      // Agrega el nuevo proveedor al inicio de la lista
      setProveedores(prev => {
        const newData = [nuevoProveedor, ...prev];
        // Update filtered data if no search term
        if (searchTerm === "") {
          setFilteredProveedores(newData);
        }
        return newData;
      });
      
      // Muestra notificación toast
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Nuevo proveedor agregado',
        text: `Se agregó: ${nuevoProveedor.nombre}`,
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });

    const unsubscribeUpdated = subscribe('ProveedorUpdated', (proveedorActualizado) => {
      // Actualiza el proveedor en la lista
      setProveedores(prev => {
        const newData = prev.map(prov => 
          prov.idProveedor === proveedorActualizado.idProveedor 
            ? proveedorActualizado 
            : prov
        );
        // Update filtered data if no search term
        if (searchTerm === "") {
          setFilteredProveedores(newData);
        }
        return newData;
      });
      
      // Muestra notificación toast
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Proveedor actualizado',
        text: `Se actualizó: ${proveedorActualizado.nombre}`,
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });

    const unsubscribeDeleted = subscribe('ProveedorDeleted', (id) => {
      // Marca el proveedor como inactivo
      setProveedores(prev => {
        const newData = prev.map(prov => 
          prov.idProveedor === id ? { ...prov, esActivo: false } : prov
        );
        // Update filtered data if no search term
        if (searchTerm === "") {
          setFilteredProveedores(newData);
        }
        return newData;
      });
      
      // Muestra notificación toast
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Proveedor eliminado',
        text: 'Un proveedor fue eliminado',
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });

    // Limpieza de suscripciones al desmontar el componente
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [subscribe, searchTerm]); // Dependencia: subscribe

  const columns = [
    {
      name: "Nombre",
      selector: (row) => row.nombre,
      sortable: true,
    },
    {
      name: "Correo",
      selector: (row) => row.correo,
      sortable: true,
    },
    {
      name: "Telefono",
      selector: (row) => row.telefono,
      sortable: true,
    },
    {
      name: "Estado",
      selector: (row) => row.esActivo,
      sortable: true,
      cell: (row) => {
        let clase;
        clase = row.esActivo
          ? "badge badge-info p-2"
          : "badge badge-danger p-2";
        return (
          <span className={clase}>{row.esActivo ? "Activo" : "No Activo"}</span>
        );
      },
    },
    {
      name: "",
      cell: (row) => (
        <>
          <Button
            color="primary"
            size="sm"
            className="mr-2"
            onClick={() => abrirEditarModal(row)}
          >
            <i className="fas fa-pen-alt"></i>
          </Button>

          <Button
            color="danger"
            size="sm"
            onClick={() => eliminarProveedor(row.idProveedor)}
          >
            <i className="fas fa-trash-alt"></i>
          </Button>
        </>
      ),
    },
  ];

  const customStyles = {
    headCells: {
      style: {
        fontSize: "13px",
        fontWeight: 800,
      },
    },
    headRow: {
      style: {
        backgroundColor: "#eee",
      },
    },
  };

  const paginationComponentOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  const abrirEditarModal = (data) => {
    setProveedor(data);
    setVerModal(!verModal);
  };

  const cerrarModal = () => {
    setProveedor(modeloProveedor);
    setVerModal(!verModal);
  };

  const guardarCambios = async () => {
    try {
      let response;
      if (proveedor.idProveedor === 0) {
        const newProveedor = {
          nombre: proveedor.nombre,
          correo: proveedor.correo,
          telefono: proveedor.telefono,
          esActivo: proveedor.esActivo,
        };

        response = await fetch("api/proveedor/Guardar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(newProveedor),
        });
      } else {
        response = await fetch("api/proveedor/Editar", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(proveedor),
        });
      }

      if (response.ok) {
        // No es necesario actualizar manualmente, SignalR se encargará
        setProveedor(modeloProveedor);
        setVerModal(!verModal);
        Swal.fire(
          `${proveedor.idProveedor === 0 ? "Guardado" : "Actualizado"}`,
          `El proveedor fue ${
            proveedor.idProveedor === 0 ? "agregado" : "actualizado"
          }`,
          "success"
        );
      } else {
        const errorData = await response.json();
        Swal.fire("Error", errorData.message || "Error al guardar", "error");
      }
    } catch (error) {
      console.error("Error al guardar proveedor:", error);
      Swal.fire("Error", "Ocurrió un error inesperado", "error");
    }
  };

  const eliminarProveedor = async (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Desea eliminar el proveedor",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "No, volver",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          let response = await fetch(`api/proveedor/Eliminar/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            // No es necesario actualizar manualmente, SignalR se encargará
            Swal.fire("Eliminado!", "El proveedor fue eliminado.", "success");
          } else {
            const errorData = await response.json();
            Swal.fire("Error", errorData.message || "Error al eliminar", "error");
          }
        } catch (error) {
          console.error("Error eliminando proveedor:", error);
          Swal.fire("Error", "Ocurrió un error inesperado", "error");
        }
      }
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    guardarCambios();
  };

  return (
    <>
      <Card>
        <CardHeader style={{ backgroundColor: "#4e73df", color: "white" }}>
          Lista de Proveedores
        </CardHeader>
        <CardBody>
          <Row className="mb-3">
            <Col md="4">
              <Button
                color="success"
                size="sm"
                onClick={() => setVerModal(!verModal)}
              >
                Nuevo Proveedor
              </Button>
            </Col>
            <Col md="4">
              <div className="d-flex gap-2">
                <Button
                  color="danger"
                  size="sm"
                  onClick={exportToPDF}
                  className="mr-2"
                >
                  <i className="fas fa-file-pdf"></i> PDF
                </Button>
                <Button
                  color="info"
                  size="sm"
                  onClick={exportToExcel}
                >
                  <i className="fas fa-file-excel"></i> Excel
                </Button>
              </div>
            </Col>
            <Col md="4">
              <Input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={handleSearch}
                bsSize="sm"
                style={{
                  border: '2px solid #4e73df',
                  borderRadius: '5px'
                }}
              />
            </Col>
          </Row>
          <DataTable
            columns={columns}
            data={filteredProveedores}
            progressPending={pendiente}
            pagination
            paginationComponentOptions={paginationComponentOptions}
            customStyles={customStyles}
            noDataComponent={
              <div className="text-center p-4">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <p className="text-muted">No se encontraron registros coincidentes</p>
              </div>
            }
          />
        </CardBody>
      </Card>

      <Modal isOpen={verModal}>
        <ModalHeader>Detalle Proveedor</ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label>Nombre</Label>
                  <Input
                    bsSize="sm"
                    name="nombre"
                    onChange={handleChange}
                    value={proveedor.nombre}
                    required
                  />
                </FormGroup>
              </Col>
              <Col sm={6}>
                <FormGroup>
                  <Label>Correo</Label>
                  <Input
                    bsSize="sm"
                    name="correo"
                    onChange={handleChange}
                    value={proveedor.correo}
                    type="email"
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label>Telefono</Label>
                  <Input
                    bsSize="sm"
                    name="telefono"
                    onChange={handleChange}
                    value={proveedor.telefono}
                  />
                </FormGroup>
              </Col>
              <Col sm={6}>
                <FormGroup>
                  <Label>Estado</Label>
                  <Input
                    bsSize="sm"
                    type={"select"}
                    name="esActivo"
                    onChange={handleChange}
                    value={proveedor.esActivo}
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>No Activo</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button size="sm" color="primary" type="submit">
              Guardar
            </Button>
            <Button size="sm" color="danger" onClick={cerrarModal}>
              Cerrar
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
};

export default Proveedor;