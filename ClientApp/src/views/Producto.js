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

const modeloProducto = {
  idProducto: 0,
  codigo: "",
  marca: "",
  descripcion: "",
  idCategoria: 0,
  idProveedor: 0,
  stock: 1,
  precio: 0,
  esActivo: true,
};

const Producto = () => {
  const [producto, setProducto] = useState(modeloProducto);
  const [pendiente, setPendiente] = useState(true);
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [verModal, setVerModal] = useState(false);
  const { subscribe } = useSignalR(); // Obtiene la función subscribe del contexto

  const handleChange = (e) => {
    let value;

    if (e.target.name === "idCategoria" || e.target.name === "idProveedor") {
      value = e.target.value;
    } else if (e.target.name === "esActivo") {
      value = e.target.value === "true" ? true : false;
    } else {
      value = e.target.value;
    }

    setProducto({
      ...producto,
      [e.target.name]: value,
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    
    if (value === "") {
      setFilteredProductos(productos);
    } else {
      const filtered = productos.filter((item) =>
        item.codigo.toLowerCase().includes(value) ||
        item.marca.toLowerCase().includes(value) ||
        item.descripcion.toLowerCase().includes(value) ||
        (item.idCategoriaNavigation?.descripcion || "").toLowerCase().includes(value) ||
        (item.idProveedorNavigation?.nombre || "").toLowerCase().includes(value) ||
        (item.esActivo ? "activo" : "no activo").includes(value)
      );
      setFilteredProductos(filtered);
    }
  };

  const exportToPDF = () => {
    const printData = filteredProductos.map(prod => ({
      Codigo: prod.codigo,
      Marca: prod.marca,
      Descripcion: prod.descripcion,
      Categoria: prod.idCategoriaNavigation?.descripcion || '',
      Proveedor: prod.idProveedorNavigation?.nombre || '',
      Stock: prod.stock,
      Precio: `$${prod.precio}`,
      Estado: prod.esActivo ? "Activo" : "No Activo"
    }));

    printJS({
      printable: printData,
      properties: ['Codigo', 'Marca', 'Descripcion', 'Categoria', 'Proveedor', 'Stock', 'Precio', 'Estado'],
      type: 'json',
      gridHeaderStyle: 'color: black; border: 2px solid #3971A5; font-weight: bold;',
      gridStyle: 'border: 2px solid #3971A5; margin-bottom: 20px',
      documentTitle: 'Lista de Productos',
      header: 'Lista de Productos'
    });
  };

  const exportToExcel = () => {
    const excelData = filteredProductos.map(prod => ({
      'Código': prod.codigo,
      'Marca': prod.marca,
      'Descripción': prod.descripcion,
      'Categoría': prod.idCategoriaNavigation?.descripcion || '',
      'Proveedor': prod.idProveedorNavigation?.nombre || '',
      'Stock': prod.stock,
      'Precio': prod.precio,
      'Estado': prod.esActivo ? 'Activo' : 'No Activo',
      'ID': prod.idProducto
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    XLSX.writeFile(wb, 'productos.xlsx');
  };

  const obtenerCategorias = async () => {
    try {
      let response = await fetch("api/categoria/Lista");
      if (response.ok) {
        let data = await response.json();
        setCategorias(() => data.filter((item) => item.esActivo));
      }
    } catch (error) {
      console.error("Error obteniendo categorías:", error);
    }
  };

  const obtenerProveedores = async () => {
    try {
      let response = await fetch("api/proveedor/Lista");
      if (response.ok) {
        let data = await response.json();
        setProveedores(() => data.filter((item) => item.esActivo));
      }
    } catch (error) {
      console.error("Error obteniendo proveedores:", error);
    }
  };

  const obtenerProductos = async () => {
    try {
      let response = await fetch("api/producto/Lista");
      if (response.ok) {
        let data = await response.json();
        setProductos(() => data);
        setFilteredProductos(() => data);
        setPendiente(false);
      }
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      setPendiente(false);
    }
  };

  useEffect(() => {
    obtenerCategorias();
    obtenerProveedores();
    obtenerProductos();

    // Configurar suscripciones a eventos de SignalR
    const unsubscribeCreated = subscribe('ProductoCreated', (nuevoProducto) => {
      // Agrega el nuevo producto al inicio de la lista
      setProductos(prev => {
        const newData = [nuevoProducto, ...prev];
        // Update filtered data if no search term
        if (searchTerm === "") {
          setFilteredProductos(newData);
        }
        return newData;
      });
      
      // Muestra notificación toast
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Nuevo producto agregado',
        text: `Se agregó: ${nuevoProducto.descripcion}`,
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });

    const unsubscribeUpdated = subscribe('ProductoUpdated', (productoActualizado) => {
      // Actualiza el producto en la lista
      setProductos(prev => {
        const newData = prev.map(prod => 
          prod.idProducto === productoActualizado.idProducto 
            ? productoActualizado 
            : prod
        );
        // Update filtered data if no search term
        if (searchTerm === "") {
          setFilteredProductos(newData);
        }
        return newData;
      });
      
      // Muestra notificación toast
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Producto actualizado',
        text: `Se actualizó: ${productoActualizado.descripcion}`,
        showConfirmButton: false,
        timer: 3000,
        toast: true
      });
    });

    const unsubscribeDeleted = subscribe('ProductoDeleted', (id) => {
      // Marca el producto como inactivo
      setProductos(prev => {
        const newData = prev.map(prod => 
          prod.idProducto === id ? { ...prod, esActivo: false } : prod
        );
        // Update filtered data if no search term
        if (searchTerm === "") {
          setFilteredProductos(newData);
        }
        return newData;
      });
      
      // Muestra notificación toast
      Swal.fire({
        position: 'top-end',
        icon: 'info',
        title: 'Producto eliminado',
        text: 'Un producto fue eliminado',
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
      name: "Codigo",
      selector: (row) => row.codigo,
      sortable: true,
    },
    {
      name: "Marca",
      selector: (row) => row.marca,
      sortable: true,
    },
    {
      name: "Descripcion",
      selector: (row) => row.descripcion,
      sortable: true,
    },
    {
      name: "Categoria",
      selector: (row) => row.idCategoriaNavigation,
      sortable: true,
      cell: (row) => row.idCategoriaNavigation.descripcion,
    },
    {
      name: "Proveedor",
      selector: (row) => row.idProveedorNavigation,
      sortable: true,
      cell: (row) => row.idProveedorNavigation?.nombre || "Sin proveedor",
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
            onClick={() => eliminarProducto(row.idProducto)}
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
    setProducto(data);
    setVerModal(!verModal);
  };

  const cerrarModal = () => {
    setProducto(modeloProducto);
    setVerModal(!verModal);
  };

  const guardarCambios = async () => {
    try {
      // Eliminar propiedades de navegación para evitar problemas en la serialización
      const productoParaEnviar = { ...producto };
      delete productoParaEnviar.idCategoriaNavigation;
      delete productoParaEnviar.idProveedorNavigation;

      let response;
      if (productoParaEnviar.idProducto === 0) {
        response = await fetch("api/producto/Guardar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(productoParaEnviar),
        });
      } else {
        response = await fetch("api/producto/Editar", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json;charset=utf-8",
          },
          body: JSON.stringify(productoParaEnviar),
        });
      }

      if (response.ok) {
        // No necesitamos obtenerProductos porque SignalR actualizará en tiempo real
        setProducto(modeloProducto);
        setVerModal(!verModal);

        Swal.fire(
          `${productoParaEnviar.idProducto === 0 ? "Guardado" : "Actualizado"}`,
          `El producto fue ${
            productoParaEnviar.idProducto === 0 ? "Agregado" : "Actualizado"
          }`,
          "success"
        );
      } else {
        const errorText = await response.text();
        Swal.fire("Opp!", `No se pudo guardar: ${errorText}`, "warning");
      }
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      Swal.fire("Error", "Ocurrió un error inesperado", "error");
    }
  };

  const eliminarProducto = async (id) => {
    Swal.fire({
      title: "¿Está seguro?",
      text: "Desea eliminar el producto",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, continuar",
      cancelButtonText: "No, volver",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch("api/producto/Eliminar/" + id, {
          method: "DELETE",
        }).then((response) => {
          if (response.ok) {
            // No es necesario obtenerProductos porque SignalR actualizará
            Swal.fire("Eliminado!", "El producto fue eliminado.", "success");
          } else {
            response.text().then(errorText => {
              Swal.fire("Error", `Error al eliminar: ${errorText}`, "error");
            });
          }
        }).catch(error => {
          console.error("Error eliminando producto:", error);
          Swal.fire("Error", "Ocurrió un error inesperado", "error");
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
      <Card>
        <CardHeader style={{ backgroundColor: "#4e73df", color: "white" }}>
          Lista de Productos
        </CardHeader>
        <CardBody>
          <Row className="mb-3">
            <Col md="4">
              <Button
                color="success"
                size="sm"
                onClick={() => setVerModal(!verModal)}
              >
                Nuevo Producto
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
            data={filteredProductos}
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

      <Modal isOpen={verModal} size="lg">
        <ModalHeader>Detalle Producto</ModalHeader>
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label>Código</Label>
                  <Input
                    bsSize="sm"
                    name="codigo"
                    onChange={handleChange}
                    value={producto.codigo}
                  />
                </FormGroup>
              </Col>
              <Col sm={6}>
                <FormGroup>
                  <Label>Marca</Label>
                  <Input
                    bsSize="sm"
                    name="marca"
                    onChange={handleChange}
                    value={producto.marca}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label>Descripción</Label>
                  <Input
                    bsSize="sm"
                    name="descripcion"
                    onChange={handleChange}
                    value={producto.descripcion}
                    required
                  />
                </FormGroup>
              </Col>
              <Col sm={6}>
                <FormGroup>
                  <Label>Categoría</Label>
                  <Input
                    bsSize="sm"
                    type={"select"}
                    name="idCategoria"
                    onChange={handleChange}
                    value={producto.idCategoria}
                    required
                  >
                    <option value={0}>Seleccionar</option>
                    {categorias.map((item) => (
                      <option key={item.idCategoria} value={item.idCategoria}>
                        {item.descripcion}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label>Proveedor</Label>
                  <Input
                    bsSize="sm"
                    type={"select"}
                    name="idProveedor"
                    onChange={handleChange}
                    value={producto.idProveedor}
                  >
                    <option value={0}>Seleccionar</option>
                    {proveedores.map((item) => (
                      <option key={item.idProveedor} value={item.idProveedor}>
                        {item.nombre}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
              <Col sm={3}>
                <FormGroup>
                  <Label>Stock</Label>
                  <Input
                    bsSize="sm"
                    name="stock"
                    onChange={handleChange}
                    value={producto.stock}
                    type="number"
                    min={1}
                    required
                  />
                </FormGroup>
              </Col>
              <Col sm={3}>
                <FormGroup>
                  <Label>Precio</Label>
                  <Input
                    bsSize="sm"
                    name="precio"
                    onChange={handleChange}
                    value={producto.precio}
                    type="number"
                    min={0.01}
                    step="0.01"
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col sm={3}>
                <FormGroup>
                  <Label>Estado</Label>
                  <Input
                    bsSize="sm"
                    type={"select"}
                    name="esActivo"
                    onChange={handleChange}
                    value={producto.esActivo}
                  >
                    <option value={true}>Activo</option>
                    <option value={false}>Inactivo</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
          </ModalBody>
          <ModalFooter>
            <Button type="submit" size="sm" color="primary">
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

export default Producto;