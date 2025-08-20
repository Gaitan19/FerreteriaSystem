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
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { exportToPDF, exportToExcel, applySearchFilter } from "../utils/exportHelpers";
import { useSignalR } from "../context/SignalRProvider"; // Importa el hook de SignalR

const modeloUsuario = {
  idUsuario: 0,
  nombre: "",
  correo: "",
  telefono: "",
  idRol: 0,
  clave: "",
  esActivo: true,
  claveActual: "",
  claveNueva: "",
};

const Usuario = () => {
  const [usuario, setUsuario] = useState(modeloUsuario);
  const [pendiente, setPendiente] = useState(true);
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roles, setRoles] = useState([]);
  const [verModal, setVerModal] = useState(false);
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [cambiandoClave, setCambiandoClave] = useState(false);
  const { subscribe } = useSignalR(); // Obtiene la función subscribe del contexto

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario({
      ...usuario,
      [name]: value,
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    const searchFields = [
      { accessor: (item) => item.nombre },
      { accessor: (item) => item.correo },
      { accessor: (item) => item.telefono },
      { accessor: (item) => item.rol?.descripcion || "" },
      { accessor: (item) => item.esActivo ? "activo" : "no activo" }
    ];
    
    const filtered = applySearchFilter(usuarios, value, searchFields);
    setFilteredUsuarios(filtered);
  };

  const exportToPDFHandler = () => {
    const columns = [
      { header: 'Nombre', accessor: (row) => row.nombre },
      { header: 'Correo', accessor: (row) => row.correo },
      { header: 'Teléfono', accessor: (row) => row.telefono },
      { header: 'Rol', accessor: (row) => row.rol?.descripcion || '' },
      { header: 'Estado', accessor: (row) => row.esActivo ? "Activo" : "No Activo" }
    ];
    
    exportToPDF(filteredUsuarios, columns, 'Lista_de_Usuarios');
  };

  const exportToExcelHandler = () => {
    const excelData = filteredUsuarios.map(user => ({
      'Nombre': user.nombre,
      'Correo': user.correo,
      'Teléfono': user.telefono,
      'Rol': user.rol?.descripcion || '',
      'Estado': user.esActivo ? 'Activo' : 'No Activo',
      'ID': user.idUsuario
    }));

    exportToExcel(excelData, 'Usuarios');
  };

  const obtenerRoles = async () => {
    try {
      let response = await fetch("api/rol/Lista");
      if (response.ok) {
        let data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      Swal.fire("Error", "Error al obtener roles", "error");
    }
  };

  const obtenerUsuarios = async () => {
    try {
      let response = await fetch("api/usuario/Lista");
      if (response.ok) {
        let data = await response.json();
        setUsuarios(data);
        setFilteredUsuarios(data);
        setPendiente(false);
      }
    } catch (error) {
      Swal.fire("Error", "Error al obtener usuarios", "error");
    }
  };

  useEffect(() => {
    obtenerRoles();
    obtenerUsuarios();

    // Configurar suscripciones a eventos de SignalR
    const unsubscribeCreated = subscribe('UsuarioCreated', (nuevoUsuario) => {
      // Agrega el nuevo usuario al inicio de la lista
      setUsuarios(prev => {
        const newData = [nuevoUsuario, ...prev];
        // Apply current search filter to new data
        const searchFields = [
          { accessor: (item) => item.nombre },
          { accessor: (item) => item.correo },
          { accessor: (item) => item.telefono },
          { accessor: (item) => item.rol?.descripcion || "" },
          { accessor: (item) => item.esActivo ? "activo" : "no activo" }
        ];
        const filtered = applySearchFilter(newData, searchTerm, searchFields);
        setFilteredUsuarios(filtered);
        return newData;
      });
      
      // Muestra notificación toast
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Nuevo usuario agregado',
        text: `Se agregó: ${nuevoUsuario.nombre}`,
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });

    const unsubscribeUpdated = subscribe('UsuarioUpdated', (usuarioActualizado) => {
      // Actualiza el usuario en la lista
      setUsuarios(prev => {
        const newData = prev.map(usr => 
          usr.idUsuario === usuarioActualizado.idUsuario 
            ? { ...usr, ...usuarioActualizado } 
            : usr
        );
        // Apply current search filter to new data
        const searchFields = [
          { accessor: (item) => item.nombre },
          { accessor: (item) => item.correo },
          { accessor: (item) => item.telefono },
          { accessor: (item) => item.rol?.descripcion || "" },
          { accessor: (item) => item.esActivo ? "activo" : "no activo" }
        ];
        const filtered = applySearchFilter(newData, searchTerm, searchFields);
        setFilteredUsuarios(filtered);
        return newData;
      });
      
      // Muestra notificación toast
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Usuario actualizado',
        text: `Se actualizó: ${usuarioActualizado.nombre}`,
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });

    const unsubscribeDeleted = subscribe('UsuarioDeleted', (id) => {
      // Marca el usuario como inactivo
      setUsuarios(prev => {
        const newData = prev.map(usr => 
          usr.idUsuario === id ? { ...usr, esActivo: false } : usr
        );
        // Apply current search filter to new data
        const searchFields = [
          { accessor: (item) => item.nombre },
          { accessor: (item) => item.correo },
          { accessor: (item) => item.telefono },
          { accessor: (item) => item.rol?.descripcion || "" },
          { accessor: (item) => item.esActivo ? "activo" : "no activo" }
        ];
        const filtered = applySearchFilter(newData, searchTerm, searchFields);
        setFilteredUsuarios(filtered);
        return newData;
      });
      
      // Muestra notificación toast
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Usuario eliminado',
        text: 'Un usuario fue eliminado',
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribe]); // Removed searchTerm dependency

  // Separate useEffect to handle search term changes
  useEffect(() => {
    const searchFields = [
      { accessor: (item) => item.nombre },
      { accessor: (item) => item.correo },
      { accessor: (item) => item.telefono },
      { accessor: (item) => item.rol?.descripcion || "" },
      { accessor: (item) => item.esActivo ? "activo" : "no activo" }
    ];
    const filtered = applySearchFilter(usuarios, searchTerm, searchFields);
    setFilteredUsuarios(filtered);
  }, [searchTerm, usuarios]);

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
      name: "Rol",
      selector: (row) => row.idRolNavigation,
      sortable: true,
      cell: (row) => row.idRolNavigation?.descripcion || "Sin rol", // Manejo de nulos
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
      name: "Acciones",
      cell: (row) => (
        <div className="d-flex">
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
            onClick={() => eliminarUsuario(row.idUsuario)}
          >
            <i className="fas fa-trash-alt"></i>
          </Button>
        </div>
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
    setUsuario({
      ...data,
      clave: "",
      claveActual: "",
      claveNueva: "",
    });
    setCambiandoClave(false);
    setVerModal(true);
  };

  const abrirNuevoModal = () => {
    setUsuario(modeloUsuario);
    setCambiandoClave(false);
    setVerModal(true);
  };

  const cerrarModal = () => {
    setUsuario(modeloUsuario);
    setVerModal(false);
    setVisiblePassword(false);
    setCambiandoClave(false);
  };

  const guardarCambios = async () => {
    try {
      let payload;
      let url;
      let method;

      if (usuario.idUsuario === 0) {
        // Nuevo usuario
        payload = { ...usuario };
        delete payload.idRolNavigation;
        url = "api/usuario/Guardar";
        method = "POST";
      } else {
        // Edición existente
        payload = {
          idUsuario: usuario.idUsuario,
          nombre: usuario.nombre,
          correo: usuario.correo,
          telefono: usuario.telefono,
          idRol: usuario.idRol,
          esActivo: usuario.esActivo === "true" || usuario.esActivo === true,
          claveActual: cambiandoClave ? usuario.claveActual : "",
          claveNueva: cambiandoClave ? usuario.claveNueva : "",
        };

        url = "api/usuario/Editar";
        method = "PATCH";
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // No es necesario obtenerUsuarios porque SignalR actualizará
        cerrarModal();
        Swal.fire(
          `${usuario.idUsuario === 0 ? "Creado" : "Actualizado"}`,
          `El usuario fue ${
            usuario.idUsuario === 0 ? "agregado" : "actualizado"
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

  const eliminarUsuario = async (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "¿Desea eliminar este usuario permanentemente?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`api/usuario/Eliminar/${id}`, {
          method: "DELETE",
        })
          .then((response) => {
            if (response.ok) {
              // No es necesario obtenerUsuarios porque SignalR actualizará
              Swal.fire("Eliminado!", "El usuario fue eliminado.", "success");
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

  const handleVisiblePassword = () => {
    setVisiblePassword((prev) => !prev);
  };

  return (
    <>
      <Card className="shadow mb-4">
        <CardHeader
          className="py-3"
          style={{ backgroundColor: "#4e73df", color: "white" }}
        >
          <h6 className="m-0 font-weight-bold">Lista de Usuarios</h6>
        </CardHeader>
        <CardBody>
          <Row className="mb-3">
            <Col md="4">
              <Button color="success" size="sm" onClick={abrirNuevoModal}>
                <i className="fas fa-plus mr-1"></i> Nuevo Usuario
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
            data={filteredUsuarios}
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

      <Modal isOpen={verModal} toggle={cerrarModal} centered>
        <ModalHeader toggle={cerrarModal}>
          {usuario.idUsuario === 0 ? "Nuevo Usuario" : "Editar Usuario"}
        </ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label>Nombre *</Label>
                  <Input
                    bsSize="sm"
                    name="nombre"
                    onChange={handleChange}
                    value={usuario.nombre}
                    required
                  />
                </FormGroup>
              </Col>
              <Col sm={6}>
                <FormGroup>
                  <Label>Correo *</Label>
                  <Input
                    bsSize="sm"
                    name="correo"
                    onChange={handleChange}
                    value={usuario.correo}
                    type="email"
                    required
                  />
                </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label>Teléfono</Label>
                  <Input
                    bsSize="sm"
                    name="telefono"
                    onChange={handleChange}
                    value={usuario.telefono}
                  />
                </FormGroup>
              </Col>
              <Col sm={6}>
                <FormGroup>
                  <Label>Rol *</Label>
                  <Input
                    bsSize="sm"
                    type="select"
                    name="idRol"
                    onChange={handleChange}
                    value={usuario.idRol}
                    required
                  >
                    <option value="">Seleccionar rol...</option>
                    {roles.map((item) => (
                      <option key={item.idRol} value={item.idRol}>
                        {item.descripcion}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>

            {/* Contraseña para nuevo usuario */}
            {usuario.idUsuario === 0 && (
              <Row>
                <Col sm="6">
                  <FormGroup>
                    <Label>Contraseña *</Label>
                    <div className="position-relative">
                      <Input
                        bsSize="sm"
                        name="clave"
                        onChange={handleChange}
                        value={usuario.clave}
                        type={visiblePassword ? "text" : "password"}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-sm position-absolute"
                        style={{ right: 5, top: 0, zIndex: 10 }}
                        onClick={handleVisiblePassword}
                      >
                        {visiblePassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </FormGroup>
                </Col>
                <Col sm="6">
                  <FormGroup>
                    <Label>Estado *</Label>
                    <Input
                      bsSize="sm"
                      type="select"
                      name="esActivo"
                      onChange={handleChange}
                      value={usuario.esActivo}
                      required
                    >
                      <option value={true}>Activo</option>
                      <option value={false}>Inactivo</option>
                    </Input>
                  </FormGroup>
                </Col>
              </Row>
            )}

            {/* Campos para edición de usuario existente */}
            {usuario.idUsuario !== 0 && (
              <>
                <Row>
                  <Col sm="6">
                    <FormGroup>
                      <Label>Estado *</Label>
                      <Input
                        bsSize="sm"
                        type="select"
                        name="esActivo"
                        onChange={handleChange}
                        value={usuario.esActivo}
                        required
                      >
                        <option value={true}>Activo</option>
                        <option value={false}>Inactivo</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col sm="6">
                    <FormGroup className="d-flex align-items-center mt-4">
                      <Input
                        type="checkbox"
                        id="cambiarClave"
                        checked={cambiandoClave}
                        onChange={() => setCambiandoClave(!cambiandoClave)}
                        className="mr-2"
                      />
                      <Label for="cambiarClave" className="mb-0">
                        Cambiar contraseña
                      </Label>
                    </FormGroup>
                  </Col>
                </Row>

                {cambiandoClave && (
                  <Row>
                    <Col sm="6">
                      <FormGroup>
                        <Label>Contraseña Actual *</Label>
                        <Input
                          bsSize="sm"
                          name="claveActual"
                          onChange={handleChange}
                          value={usuario.claveActual}
                          type="password"
                          required
                        />
                      </FormGroup>
                    </Col>
                    <Col sm="6">
                      <FormGroup>
                        <Label>Nueva Contraseña *</Label>
                        <Input
                          bsSize="sm"
                          name="claveNueva"
                          onChange={handleChange}
                          value={usuario.claveNueva}
                          type="password"
                          required
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter className="d-flex justify-content-between">
            <Button color="secondary" size="sm" onClick={cerrarModal}>
              Cancelar
            </Button>
            <Button type="submit" color="primary" size="sm">
              {usuario.idUsuario === 0 ? "Crear Usuario" : "Guardar Cambios"}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
};

export default Usuario;