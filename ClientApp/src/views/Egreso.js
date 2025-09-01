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
import { exportToPDF, exportToExcel, applySearchFilter } from "../utils/exportHelpers";
import { useSignalR } from "../context/SignalRProvider";

const modeloEgreso = {
  idEgreso: 0,
  descripcion: "",
  monto: 0,
  tipoMoneda: "efectivo",
  idUsuario: 0,
  esActivo: true,
};

const Egreso = () => {
  const [egreso, setEgreso] = useState(modeloEgreso);
  const [pendiente, setPendiente] = useState(true);
  const [egresos, setEgresos] = useState([]);
  const [filteredEgresos, setFilteredEgresos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [usuarios, setUsuarios] = useState([]);
  const [verModal, setVerModal] = useState(false);
  const [modoSoloLectura, setModoSoloLectura] = useState(false);
  const { subscribe } = useSignalR();

  const handleChange = (e) => {
    let value = e.target.value;
    
    if (e.target.name === "monto") {
      value = parseFloat(value) || 0;
    } else if (e.target.name === "idUsuario") {
      value = parseInt(value) || 0;
    } else if (e.target.name === "esActivo") {
      value = e.target.value === "true";
    }

    setEgreso({
      ...egreso,
      [e.target.name]: value,
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    const searchFields = [
      { accessor: (item) => item.descripcion },
      { accessor: (item) => item.monto?.toString() || "" },
      { accessor: (item) => item.tipoMoneda },
      { accessor: (item) => item.idUsuarioNavigation?.nombre || "" },
      { accessor: (item) => item.esActivo ? "activo" : "no activo" }
    ];
    
    const filtered = applySearchFilter(egresos, value, searchFields);
    setFilteredEgresos(filtered);
  };

  const exportToPDFHandler = () => {
    const columns = [
      { header: 'Descripción', accessor: (row) => row.descripcion },
      { header: 'Monto', accessor: (row) => `$${row.monto?.toFixed(2) || '0.00'}` },
      { header: 'Tipo Moneda', accessor: (row) => row.tipoMoneda },
      { header: 'Usuario', accessor: (row) => row.idUsuarioNavigation?.nombre || '' },
      { header: 'Fecha', accessor: (row) => new Date(row.fechaRegistro).toLocaleDateString() },
      { header: 'Estado', accessor: (row) => row.esActivo ? "Activo" : "No Activo" }
    ];
    
    exportToPDF(filteredEgresos, columns, 'Lista_de_Egresos');
  };

  const exportToExcelHandler = () => {
    const excelData = filteredEgresos.map(egr => ({
      'ID': egr.idEgreso,
      'Descripción': egr.descripcion,
      'Monto': egr.monto,
      'Tipo Moneda': egr.tipoMoneda,
      'Usuario': egr.idUsuarioNavigation?.nombre || '',
      'Fecha': new Date(egr.fechaRegistro).toLocaleDateString(),
      'Estado': egr.esActivo ? 'Activo' : 'No Activo'
    }));

    exportToExcel(excelData, 'Egresos');
  };

  const obtenerUsuarios = async () => {
    try {
      let response = await fetch("api/usuario/Lista");
      if (response.ok) {
        let data = await response.json();
        setUsuarios(data.filter(u => u.esActivo));
      }
    } catch (error) {
      Swal.fire("Error", "Error al obtener usuarios", "error");
    }
  };

  const obtenerEgresos = async () => {
    try {
      let response = await fetch("api/egreso/Lista");
      if (response.ok) {
        let data = await response.json();
        setEgresos(data);
        setFilteredEgresos(data);
        setPendiente(false);
      }
    } catch (error) {
      Swal.fire("Error", "Error al obtener egresos", "error");
    }
  };

  useEffect(() => {
    obtenerEgresos();
    obtenerUsuarios();

    // Set up SignalR listeners for real-time updates
    const unsubscribeCreated = subscribe('EgresoCreated', (nuevoEgreso) => {
      setEgresos(prev => {
        const newData = [nuevoEgreso, ...prev];
        const searchFields = [
          { accessor: (item) => item.descripcion },
          { accessor: (item) => item.monto?.toString() || "" },
          { accessor: (item) => item.tipoMoneda },
          { accessor: (item) => item.idUsuarioNavigation?.nombre || "" },
          { accessor: (item) => item.esActivo ? "activo" : "no activo" }
        ];
        const filtered = applySearchFilter(newData, searchTerm, searchFields);
        setFilteredEgresos(filtered);
        return newData;
      });
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Nuevo egreso agregado',
        text: `Se agregó: ${nuevoEgreso.descripcion}`,
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });

    const unsubscribeUpdated = subscribe('EgresoUpdated', (egresoActualizado) => {
      setEgresos(prev => {
        const newData = prev.map(egr => 
          egr.idEgreso === egresoActualizado.idEgreso 
            ? egresoActualizado 
            : egr
        );
        const searchFields = [
          { accessor: (item) => item.descripcion },
          { accessor: (item) => item.monto?.toString() || "" },
          { accessor: (item) => item.tipoMoneda },
          { accessor: (item) => item.idUsuarioNavigation?.nombre || "" },
          { accessor: (item) => item.esActivo ? "activo" : "no activo" }
        ];
        const filtered = applySearchFilter(newData, searchTerm, searchFields);
        setFilteredEgresos(filtered);
        return newData;
      });
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Egreso actualizado',
        text: `Se actualizó: ${egresoActualizado.descripcion}`,
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });

    const unsubscribeDeleted = subscribe('EgresoDeleted', (id) => {
      setEgresos(prev => {
        const newData = prev.filter(egr => egr.idEgreso !== id);
        const searchFields = [
          { accessor: (item) => item.descripcion },
          { accessor: (item) => item.monto?.toString() || "" },
          { accessor: (item) => item.tipoMoneda },
          { accessor: (item) => item.idUsuarioNavigation?.nombre || "" },
          { accessor: (item) => item.esActivo ? "activo" : "no activo" }
        ];
        const filtered = applySearchFilter(newData, searchTerm, searchFields);
        setFilteredEgresos(filtered);
        return newData;
      });
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Egreso eliminado',
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });

    // Clean up subscriptions
    return () => {
      unsubscribeCreated();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [subscribe, searchTerm]);

  const columnas = [
    {
      name: "Descripción",
      selector: (row) => row.descripcion,
      sortable: true,
    },
    {
      name: "Monto",
      selector: (row) => row.monto,
      sortable: true,
      cell: (row) => `$${row.monto?.toFixed(2) || '0.00'}`,
    },
    {
      name: "Tipo Moneda",
      selector: (row) => row.tipoMoneda,
      sortable: true,
      cell: (row) => (
        <span className={`badge ${row.tipoMoneda === 'efectivo' ? 'badge-success' : 'badge-primary'} p-2`}>
          {row.tipoMoneda}
        </span>
      ),
    },
    {
      name: "Usuario",
      selector: (row) => row.idUsuarioNavigation?.nombre,
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => row.fechaRegistro,
      sortable: true,
      cell: (row) => new Date(row.fechaRegistro).toLocaleDateString(),
    },
    {
      name: "Estado",
      selector: (row) => row.esActivo,
      sortable: true,
      cell: (row) => {
        let clase = row.esActivo
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
            color="info"
            size="sm"
            className="mr-2"
            onClick={() => abrirVerModal(row)}
          >
            <i className="fas fa-eye"></i>
          </Button>

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
            onClick={() => eliminarEgreso(row.idEgreso)}
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
    setEgreso(data);
    setModoSoloLectura(false);
    setVerModal(!verModal);
  };

  const abrirVerModal = (data) => {
    setEgreso(data);
    setModoSoloLectura(true);
    setVerModal(!verModal);
  };

  const abrirNuevoModal = () => {
    setEgreso(modeloEgreso);
    setModoSoloLectura(false);
    setVerModal(true);
  };

  const cerrarModal = () => {
    setEgreso(modeloEgreso);
    setModoSoloLectura(false);
    setVerModal(!verModal);
  };

  const guardarCambios = async () => {
    try {
      // Eliminar propiedades de navegación para evitar problemas en la serialización
      const egresoParaEnviar = { ...egreso };
      delete egresoParaEnviar.idUsuarioNavigation;

      let response;
      if (egresoParaEnviar.idEgreso === 0) {
        response = await fetch("api/egreso/Guardar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(egresoParaEnviar),
        });
      } else {
        response = await fetch("api/egreso/Editar", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(egresoParaEnviar),
        });
      }

      if (response.ok) {
        cerrarModal();
        Swal.fire(
          `${egreso.idEgreso === 0 ? "Creado" : "Actualizado"}`,
          `El egreso fue ${
            egreso.idEgreso === 0 ? "agregado" : "actualizado"
          }`,
          "success"
        );
      } else {
        const error = await response.text();
        Swal.fire("Error", error, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Error en la conexión con el servidor", "error");
    }
  };

  const eliminarEgreso = async (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "¿Desea eliminar este egreso permanentemente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`api/egreso/Eliminar/${id}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              Swal.fire("Eliminado!", "El egreso fue eliminado.", "success");
            } else {
              return response.text().then((error) => {
                Swal.fire("Error", error, "error");
              });
            }
          })
          .catch((error) => {
            Swal.fire("Error", "Error al conectar con el servidor", "error");
          });
      }
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    guardarCambios();
  };

  return (
    <>
      <Card className="shadow mb-4">
        <CardHeader
          className="py-3"
          style={{ backgroundColor: "#dc3545", color: "white" }}
        >
          <h6 className="m-0 font-weight-bold">Lista de Egresos</h6>
        </CardHeader>
        <CardBody>
          <Row className="mb-3">
            <Col md="4">
              <Button color="success" size="sm" onClick={abrirNuevoModal}>
                <i className="fas fa-plus mr-1"></i> Nuevo Egreso
              </Button>
            </Col>
            <Col md="4">
              <div className="d-flex gap-2">
                <Button
                  color="danger"
                  size="sm"
                  onClick={exportToPDFHandler}
                  className="mr-2"
                >
                  <i className="fas fa-file-pdf"></i> PDF
                </Button>
                <Button
                  color="info"
                  size="sm"
                  onClick={exportToExcelHandler}
                >
                  <i className="fas fa-file-excel"></i> Excel
                </Button>
              </div>
            </Col>
            <Col md="4">
              <Input
                type="text"
                placeholder="Buscar egresos..."
                value={searchTerm}
                onChange={handleSearch}
                size="sm"
              />
            </Col>
          </Row>

          <DataTable
            columns={columnas}
            data={filteredEgresos}
            progressPending={pendiente}
            pagination
            paginationComponentOptions={paginationComponentOptions}
            highlightOnHover
            customStyles={customStyles}
            noDataComponent={
              <div className="text-center py-4">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <p className="text-muted">No se encontraron registros coincidentes</p>
              </div>
            }
          />
        </CardBody>
      </Card>

      <Modal isOpen={verModal} toggle={cerrarModal} centered>
        <ModalHeader toggle={cerrarModal}>
          {modoSoloLectura 
            ? "Ver Detalle Egreso" 
            : egreso.idEgreso === 0 
              ? "Nuevo Egreso" 
              : "Editar Egreso"}
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <Row>
              <Col sm={12}>
                <FormGroup>
                  <Label>Descripción *</Label>
                  <Input
                    bsSize="sm"
                    name="descripcion"
                    onChange={handleChange}
                    value={egreso.descripcion}
                    required
                    readOnly={modoSoloLectura}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label>Monto *</Label>
                  <Input
                    bsSize="sm"
                    name="monto"
                    type="number"
                    step="0.01"
                    min="0"
                    onChange={handleChange}
                    value={egreso.monto}
                    required
                    readOnly={modoSoloLectura}
                  />
                </FormGroup>
              </Col>
              <Col sm={6}>
                <FormGroup>
                  <Label>Tipo de Moneda *</Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    name="tipoMoneda"
                    onChange={handleChange}
                    value={egreso.tipoMoneda}
                    required
                    disabled={modoSoloLectura}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label>Usuario *</Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    name="idUsuario"
                    onChange={handleChange}
                    value={egreso.idUsuario}
                    required
                    disabled={modoSoloLectura}
                  >
                    <option value="">Seleccionar usuario...</option>
                    {usuarios.map((item) => (
                      <option key={item.idUsuario} value={item.idUsuario}>
                        {item.nombre}
                      </option>
                    ))}
                  </Input>
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
                    value={egreso.esActivo}
                    disabled={modoSoloLectura}
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>Inactivo</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            {!modoSoloLectura && (
              <Button type="submit" size="sm" color="primary">
                Guardar
              </Button>
            )}
            <Button size="sm" color="danger" onClick={cerrarModal}>
              Cerrar
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
};

export default Egreso;