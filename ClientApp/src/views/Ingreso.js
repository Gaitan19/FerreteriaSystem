import { useEffect, useState, useContext } from "react";
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
import { UserContext } from "../context/UserProvider";

const modeloIngreso = {
  idIngreso: 0,
  descripcion: "",
  monto: 0,
  tipoDinero: "efectivo",
  idUsuario: 0,
};

const Ingreso = () => {
  const { user } = useContext(UserContext);
  const [ingreso, setIngreso] = useState(modeloIngreso);
  const [pendiente, setPendiente] = useState(true);
  const [ingresos, setIngresos] = useState([]);
  const [filteredIngresos, setFilteredIngresos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [verModal, setVerModal] = useState(false);
  const [modoSoloLectura, setModoSoloLectura] = useState(false);

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Convert monto to number if it's the monto field
    if (e.target.name === "monto") {
      value = parseFloat(value) || 0;
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
      { accessor: (item) => item.monto },
      { accessor: (item) => item.tipoDinero },
      { accessor: (item) => item.nombreUsuario }
    ];
    
    const filtered = applySearchFilter(ingresos, value, searchFields);
    setFilteredIngresos(filtered);
  };

  const exportToPDFHandler = () => {
    const columns = [
      { header: 'Descripción', accessor: (row) => row.descripcion },
      { header: 'Fecha', accessor: (row) => row.fechaRegistro },
      { header: 'Monto', accessor: (row) => `$${row.monto}` },
      { header: 'Tipo', accessor: (row) => row.tipoDinero },
      { header: 'Usuario', accessor: (row) => row.nombreUsuario }
    ];
    
    exportToPDF(filteredIngresos, columns, 'Lista_de_Ingresos');
  };

  const exportToExcelHandler = () => {
    const excelData = filteredIngresos.map(ing => ({
      'ID': ing.idIngreso,
      'Descripción': ing.descripcion,
      'Fecha': ing.fechaRegistro,
      'Monto': ing.monto,
      'Tipo': ing.tipoDinero,
      'Usuario': ing.nombreUsuario
    }));

    exportToExcel(excelData, 'Ingresos');
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
      console.error("Error al obtener ingresos:", error);
      setPendiente(false);
    }
  };

  const abrirEditarModal = (data) => {
    setIngreso({
      ...data,
      monto: parseFloat(data.monto) || 0
    });
    setModoSoloLectura(false);
    setVerModal(!verModal);
  };

  const abrirVerModal = (data) => {
    setIngreso({
      ...data,
      monto: parseFloat(data.monto) || 0
    });
    setModoSoloLectura(true);
    setVerModal(!verModal);
  };

  const cerrarModal = () => {
    setIngreso(modeloIngreso);
    setModoSoloLectura(false);
    setVerModal(!verModal);
  };

  const guardarCambios = async () => {
    try {
      // Get current user data
      const userData = JSON.parse(user);
      
      // Prepare data for sending
      const ingresoParaEnviar = {
        ...ingreso,
        idUsuario: userData.idUsuario
      };

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
        // Refresh the list
        await obtenerIngresos();
        setIngreso(modeloIngreso);
        setVerModal(!verModal);

        Swal.fire(
          `${ingresoParaEnviar.idIngreso === 0 ? "Guardado" : "Actualizado"}`,
          `El ingreso fue ${
            ingresoParaEnviar.idIngreso === 0 ? "agregado" : "actualizado"
          }`,
          "success"
        );
      } else {
        const errorText = await response.text();
        Swal.fire("Opp!", `No se pudo guardar: ${errorText}`, "warning");
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
              // Refresh the list
              obtenerIngresos();
              Swal.fire("Eliminado!", "El ingreso fue eliminado.", "success");
            } else {
              return response.text().then((error) => {
                Swal.fire("Error", error, "error");
              });
            }
          })
          .catch((error) => {
            Swal.fire("Error", "Error en la conexión con el servidor", "error");
          });
      }
    });
  };

  useEffect(() => {
    obtenerIngresos();
  }, []);

  // Update filtered list when search term or ingresos change
  useEffect(() => {
    const searchFields = [
      { accessor: (item) => item.descripcion },
      { accessor: (item) => item.monto },
      { accessor: (item) => item.tipoDinero },
      { accessor: (item) => item.nombreUsuario }
    ];
    const filtered = applySearchFilter(ingresos, searchTerm, searchFields);
    setFilteredIngresos(filtered);
  }, [searchTerm, ingresos]);

  const columns = [
    {
      name: "Descripción",
      selector: (row) => row.descripcion,
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => row.fechaRegistro,
      sortable: true,
    },
    {
      name: "Monto",
      selector: (row) => row.monto,
      sortable: true,
      cell: (row) => `$${parseFloat(row.monto).toFixed(2)}`,
    },
    {
      name: "Tipo",
      selector: (row) => row.tipoDinero,
      sortable: true,
      cell: (row) => (
        <span className="badge badge-info p-2">
          {row.tipoDinero}
        </span>
      ),
    },
    {
      name: "Usuario",
      selector: (row) => row.nombreUsuario,
      sortable: true,
    },
    {
      name: "Acciones",
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
        fontWeight: "bold",
      },
    },
    cells: {
      style: {
        fontSize: "12px",
      },
    },
  };

  const paginationOptions = {
    rowsPerPageText: "Filas por página",
    rangeSeparatorText: "de",
    selectAllRowsItem: true,
    selectAllRowsItemText: "Todos",
  };

  return (
    <>
      <Row>
        <Col sm="12">
          <Card>
            <CardHeader style={{ backgroundColor: "#4e73df", color: "white" }}>
              <Row>
                <Col sm="6">
                  <h5>Lista de Ingresos</h5>
                </Col>
                <Col sm="6" className="text-right">
                  <Button
                    color="success"
                    size="sm"
                    onClick={() => setVerModal(!verModal)}
                  >
                    <i className="fas fa-plus-circle mr-2"></i>
                    Nuevo Ingreso
                  </Button>
                </Col>
              </Row>
            </CardHeader>
            <CardBody>
              <Row className="mb-3">
                <Col sm="3">
                  <Input
                    type="text"
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </Col>
                <Col sm="9" className="text-right">
                  <Button color="danger" size="sm" className="mr-2" onClick={exportToPDFHandler}>
                    <i className="fas fa-file-pdf mr-1"></i>
                    PDF
                  </Button>
                  <Button color="success" size="sm" onClick={exportToExcelHandler}>
                    <i className="fas fa-file-excel mr-1"></i>
                    Excel
                  </Button>
                </Col>
              </Row>
              
              <DataTable
                columns={columns}
                data={filteredIngresos}
                customStyles={customStyles}
                pagination
                paginationComponentOptions={paginationOptions}
                fixedHeader
                fixedHeaderScrollHeight="600px"
                progressPending={pendiente}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Modal isOpen={verModal} toggle={cerrarModal} size="lg">
        <form onSubmit={(e) => { e.preventDefault(); guardarCambios(); }}>
          <ModalHeader toggle={cerrarModal}>
            {ingreso.idIngreso === 0 ? "Nuevo Ingreso" : "Editar Ingreso"}
          </ModalHeader>
          <ModalBody>
            <Row>
              <Col sm={12}>
                <FormGroup>
                  <Label>Descripción</Label>
                  <Input
                    bsSize="sm"
                    type="text"
                    name="descripcion"
                    onChange={handleChange}
                    value={ingreso.descripcion}
                    placeholder="Descripción del ingreso"
                    required
                    readOnly={modoSoloLectura}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label>Monto</Label>
                  <Input
                    bsSize="sm"
                    type="number"
                    name="monto"
                    onChange={handleChange}
                    value={ingreso.monto}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                    readOnly={modoSoloLectura}
                  />
                </FormGroup>
              </Col>
              <Col sm={6}>
                <FormGroup>
                  <Label>Tipo de Dinero</Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    name="tipoDinero"
                    onChange={handleChange}
                    value={ingreso.tipoDinero}
                    disabled={modoSoloLectura}
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
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