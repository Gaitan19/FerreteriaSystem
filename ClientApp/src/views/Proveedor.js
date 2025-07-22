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
import { useSignalR } from "../context/SignalRContext";

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
  const [verModal, setVerModal] = useState(false);
  const { subscribe } = useSignalR();

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

  const obtenerProveedores = async () => {
    let response = await fetch("api/proveedor/Lista");
    if (response.ok) {
      let data = await response.json();
      setProveedores(data);
      setPendiente(false);
    }
  };

  useEffect(() => {
    obtenerProveedores();

    // Setup SignalR event listeners for real-time updates
    const unsubscribeCreated = subscribe('proveedorCreated', (newProveedor) => {
      console.log('Proveedor creado:', newProveedor);
      setProveedores(prev => [...prev, newProveedor]);
      // Show a notification
      Swal.fire({
        title: 'Nuevo proveedor',
        text: `Se ha agregado el proveedor: ${newProveedor.nombre}`,
        icon: 'info',
        timer: 3000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    });

    const unsubscribeUpdated = subscribe('proveedorUpdated', (updatedProveedor) => {
      console.log('Proveedor actualizado:', updatedProveedor);
      setProveedores(prev => 
        prev.map(prov => 
          prov.idProveedor === updatedProveedor.idProveedor ? updatedProveedor : prov
        )
      );
      // Show a notification
      Swal.fire({
        title: 'Proveedor actualizado',
        text: `Se ha actualizado el proveedor: ${updatedProveedor.nombre}`,
        icon: 'info',
        timer: 3000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    });

    const unsubscribeDeleted = subscribe('proveedorDeleted', (deletedProveedor) => {
      console.log('Proveedor eliminado:', deletedProveedor.idProveedor);
      setProveedores(prev => 
        prev.map(prov => 
          prov.idProveedor === deletedProveedor.idProveedor ? deletedProveedor : prov
        )
      );
      // Show a notification
      Swal.fire({
        title: 'Proveedor eliminado',
        text: `Se ha eliminado el proveedor: ${deletedProveedor.nombre}`,
        icon: 'warning',
        timer: 3000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    });

    // Cleanup function
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [subscribe]);

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
      Swal.fire(
        `${proveedor.idProveedor === 0 ? "Guardado" : "Actualizado"}`,
        `El proveedor fue ${
          proveedor.idProveedor === 0 ? "agregado" : "actualizado"
        }`,
        "success"
      );

      await obtenerProveedores();
      setProveedor(modeloProveedor);
      setVerModal(!verModal);
    } else {
      alert("Error al guardar");
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
        let response = await fetch(
          `api/proveedor/Eliminar/${id}`,
          {
            method: "DELETE",
          }
        );

        if (response.ok) {
          obtenerProveedores();

          Swal.fire("Eliminado!", "El proveedor fue eliminado.", "success");
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
          <Button
            color="success"
            size="sm"
            onClick={() => setVerModal(!verModal)}
          >
            Nuevo Proveedor
          </Button>
          <hr />
          <DataTable
            columns={columns}
            data={proveedores}
            progressPending={pendiente}
            pagination
            paginationComponentOptions={paginationComponentOptions}
            customStyles={customStyles}
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
