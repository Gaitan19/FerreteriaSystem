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

const modeloIngreso = {
  idIngreso: 0,
  descripcion: "",
  monto: 0,
  tipoMoneda: "efectivo",
  idUsuario: 0,
  esActivo: true,
};

const Ingreso = () => {
  const [ingreso, setIngreso] = useState(modeloIngreso);
  const [pendiente, setPendiente] = useState(true);
  const [ingresos, setIngresos] = useState([]);
  const [filteredIngresos, setFilteredIngresos] = useState([]);
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

    setIngreso({
      ...ingreso,
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
    
    const filtered = applySearchFilter(ingresos, value, searchFields);
    setFilteredIngresos(filtered);
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
    
    exportToPDF(filteredIngresos, columns, 'Lista_de_Ingresos');
  };

  const exportToExcelHandler = () => {
    const excelData = filteredIngresos.map(ing => ({
      'ID': ing.idIngreso,
      'Descripción': ing.descripcion,
      'Monto': ing.monto,
      'Tipo Moneda': ing.tipoMoneda,
      'Usuario': ing.idUsuarioNavigation?.nombre || '',
      'Fecha': new Date(ing.fechaRegistro).toLocaleDateString(),
      'Estado': ing.esActivo ? 'Activo' : 'No Activo'
    }));

    exportToExcel(excelData, 'Ingresos');
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

  const obtenerIngresos = async () => {
    try {
      let response = await fetch("api/ingreso/Lista");
      if (response.ok) {
        let data = await response.json();
        setIngresos(data);
        setFilteredIngresos(data);
        setPendiente(false);
      }
    } catch (error) {
      Swal.fire("Error", "Error al obtener ingresos", "error");
    }
  };

  useEffect(() => {
    obtenerIngresos();
    obtenerUsuarios();

    // Set up SignalR listeners for real-time updates
    const unsubscribeCreated = subscribe('IngresoCreated', (nuevoIngreso) => {
      setIngresos(prev => {
        const newData = [nuevoIngreso, ...prev];
        const searchFields = [
          { accessor: (item) => item.descripcion },
          { accessor: (item) => item.monto?.toString() || "" },
          { accessor: (item) => item.tipoMoneda },
          { accessor: (item) => item.idUsuarioNavigation?.nombre || "" },
          { accessor: (item) => item.esActivo ? "activo" : "no activo" }
        ];
        const filtered = applySearchFilter(newData, searchTerm, searchFields);
        setFilteredIngresos(filtered);
        return newData;
      });
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Nuevo ingreso agregado',
        text: `Se agregó: ${nuevoIngreso.descripcion}`,
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });

    const unsubscribeUpdated = subscribe('IngresoUpdated', (ingresoActualizado) => {
      setIngresos(prev => {
        const newData = prev.map(ing => 
          ing.idIngreso === ingresoActualizado.idIngreso 
            ? ingresoActualizado 
            : ing
        );
        const searchFields = [
          { accessor: (item) => item.descripcion },
          { accessor: (item) => item.monto?.toString() || "" },
          { accessor: (item) => item.tipoMoneda },
          { accessor: (item) => item.idUsuarioNavigation?.nombre || "" },
          { accessor: (item) => item.esActivo ? "activo" : "no activo" }
        ];
        const filtered = applySearchFilter(newData, searchTerm, searchFields);
        setFilteredIngresos(filtered);
        return newData;
      });
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Ingreso actualizado',
        text: `Se actualizó: ${ingresoActualizado.descripcion}`,
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });

    const unsubscribeDeleted = subscribe('IngresoDeleted', (id) => {
      setIngresos(prev => {
        const newData = prev.filter(ing => ing.idIngreso !== id);
        const searchFields = [
          { accessor: (item) => item.descripcion },
          { accessor: (item) => item.monto?.toString() || "" },
          { accessor: (item) => item.tipoMoneda },
          { accessor: (item) => item.idUsuarioNavigation?.nombre || "" },
          { accessor: (item) => item.esActivo ? "activo" : "no activo" }
        ];
        const filtered = applySearchFilter(newData, searchTerm, searchFields);
        setFilteredIngresos(filtered);
        return newData;
      });
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Ingreso eliminado',
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
            onClick={() => eliminarIngreso(row.idIngreso)}
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
    setIngreso(data);
    setModoSoloLectura(false);
    setVerModal(!verModal);
  };

  const abrirVerModal = (data) => {
    setIngreso(data);
    setModoSoloLectura(true);
    setVerModal(!verModal);
  };

  const abrirNuevoModal = () => {
    setIngreso(modeloIngreso);
    setModoSoloLectura(false);
    setVerModal(true);
  };

  const cerrarModal = () => {
    setIngreso(modeloIngreso);
    setModoSoloLectura(false);
    setVerModal(!verModal);
  };

  const guardarCambios = async () => {
    try {
      // Eliminar propiedades de navegación para evitar problemas en la serialización
      const ingresoParaEnviar = { ...ingreso };
      delete ingresoParaEnviar.idUsuarioNavigation;

      let response;
      if (ingresoParaEnviar.idIngreso === 0) {
        response = await fetch("api/ingreso/Guardar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(ingresoParaEnviar),
        });
      } else {
        response = await fetch("api/ingreso/Editar", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(ingresoParaEnviar),
        });
      }

      if (response.ok) {
        cerrarModal();
        Swal.fire(
          `${ingreso.idIngreso === 0 ? "Creado" : "Actualizado"}`,
          `El ingreso fue ${
            ingreso.idIngreso === 0 ? "agregado" : "actualizado"
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

  const eliminarIngreso = async (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "¿Desea eliminar este ingreso permanentemente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`api/ingreso/Eliminar/${id}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              Swal.fire("Eliminado!", "El ingreso fue eliminado.", "success");
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
          style={{ backgroundColor: "#4e73df", color: "white" }}
        >
          <h6 className="m-0 font-weight-bold">Lista de Ingresos</h6>
        </CardHeader>
        <CardBody>
          <Row className="mb-3">
            <Col md="4">
              <Button color="success" size="sm" onClick={abrirNuevoModal}>
                <i className="fas fa-plus mr-1"></i> Nuevo Ingreso
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
                placeholder="Buscar ingresos..."
                value={searchTerm}
                onChange={handleSearch}
                size="sm"
              />
            </Col>
          </Row>

          <DataTable
            columns={columnas}
            data={filteredIngresos}
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
            ? "Ver Detalle Ingreso" 
            : ingreso.idIngreso === 0 
              ? "Nuevo Ingreso" 
              : "Editar Ingreso"}
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
                    value={ingreso.descripcion}
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
                    value={ingreso.monto}
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
                    value={ingreso.tipoMoneda}
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
                    value={ingreso.idUsuario}
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
                    value={ingreso.esActivo}
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

export default Ingreso;