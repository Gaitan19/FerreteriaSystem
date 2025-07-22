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
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [verModal, setVerModal] = useState(false);
  const { subscribe } = useSignalR();

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

  const obtenerCategorias = async () => {
    let response = await fetch("api/categoria/Lista");
    if (response.ok) {
      let data = await response.json();
      setCategorias(() => data.filter((item) => item.esActivo));
    }
  };

  const obtenerProveedores = async () => {
    let response = await fetch("api/proveedor/Lista");
    if (response.ok) {
      let data = await response.json();
      setProveedores(() => data.filter((item) => item.esActivo));
    }
  };

  const obtenerProductos = async () => {
    let response = await fetch("api/producto/Lista");

    if (response.ok) {
      let data = await response.json();
      setProductos(() => data);
      setPendiente(false);
    }
  };

  useEffect(() => {
    obtenerCategorias();
    obtenerProductos();
    obtenerProveedores();

    // Setup SignalR event listeners for real-time updates
    const unsubscribeCreated = subscribe('productoCreated', (newProducto) => {
      console.log('Producto creado:', newProducto);
      setProductos(prev => [...prev, newProducto]);
      // Show a notification
      Swal.fire({
        title: 'Nuevo producto',
        text: `Se ha agregado el producto: ${newProducto.descripcion}`,
        icon: 'info',
        timer: 3000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    });

    const unsubscribeUpdated = subscribe('productoUpdated', (updatedProducto) => {
      console.log('Producto actualizado:', updatedProducto);
      setProductos(prev => 
        prev.map(prod => 
          prod.idProducto === updatedProducto.idProducto ? updatedProducto : prod
        )
      );
      // Show a notification
      Swal.fire({
        title: 'Producto actualizado',
        text: `Se ha actualizado el producto: ${updatedProducto.descripcion}`,
        icon: 'info',
        timer: 3000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
    });

    const unsubscribeDeleted = subscribe('productoDeleted', (deletedProducto) => {
      console.log('Producto eliminado:', deletedProducto.idProducto);
      setProductos(prev => 
        prev.map(prod => 
          prod.idProducto === deletedProducto.idProducto ? deletedProducto : prod
        )
      );
      // Show a notification
      Swal.fire({
        title: 'Producto eliminado',
        text: `Se ha eliminado el producto: ${deletedProducto.nombre}`,
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
      cell: (row) => row.idCategoriaNavigation?.descripcion || "Sin categoría",
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
    delete producto.idCategoriaNavigation;
    delete producto.idProveedorNavigation;

    let response;
    if (producto.idProducto === 0) {
      response = await fetch("api/producto/Guardar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(producto),
      });
    } else {
      response = await fetch("api/producto/Editar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(producto),
      });
    }

    if (response.ok) {
      await obtenerProductos();
      setProducto(modeloProducto);
      setVerModal(!verModal);

      Swal.fire(
        `${producto.idProducto === 0 ? "Guardado" : "Actualizado"}`,
        `El producto fue ${
          producto.idProducto === 0 ? "Agregado" : "Actualizado"
        }`,
        "success"
      );
    } else {
      Swal.fire("Opp!", "No se pudo guardar.", "warning");
    }
  };

  const eliminarProducto = async (id) => {
    Swal.fire({
      title: "Esta seguro?",
      text: "Desea eliminar el producto",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, continuar",
      cancelButtonText: "No, volver",
    }).then((result) => {
      if (result.isConfirmed) {
        // eslint-disable-next-line no-unused-vars
        const response = fetch("api/producto/Eliminar/" + id, {
          method: "DELETE",
        }).then((response) => {
          if (response.ok) {
            obtenerProductos();

            Swal.fire("Eliminado!", "El producto fue eliminado.", "success");
          }
        });
      }
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    guardarCambios();
  };

  console.log(productos);

  return (
    <>
      <Card>
        <CardHeader style={{ backgroundColor: "#4e73df", color: "white" }}>
          Lista de Productos
        </CardHeader>
        <CardBody>
          <Button
            color="success"
            size="sm"
            onClick={() => setVerModal(!verModal)}
          >
            Nuevo Producto
          </Button>
          <hr></hr>
          <DataTable
            columns={columns}
            data={productos}
            progressPending={pendiente}
            pagination
            paginationComponentOptions={paginationComponentOptions}
            customStyles={customStyles}
          />
        </CardBody>
      </Card>

      <Modal isOpen={verModal}>
        <ModalHeader>Detalle Producto</ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <Row>
              <Col sm={6}>
                <FormGroup>
                  <Label>Codigo</Label>
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
                  <Label>Descripcion</Label>
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
                  <Label>Categoria</Label>
                  <Input
                    bsSize="sm"
                    type={"select"}
                    name="idCategoria"
                    onChange={handleChange}
                    value={producto.idCategoria}
                    required
                  >
                    <option value={0}>Seleccionar</option>
                    {categorias.map((item) =>
                      item.esActivo ? (
                        <option key={item.idCategoria} value={item.idCategoria}>
                          {item.descripcion}
                        </option>
                      ) : (
                        <></>
                      )
                    )}
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
              <Col sm={6}>
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
              <Col sm={6}>
                <FormGroup>
                  <Label>Precio</Label>
                  <Input
                    bsSize="sm"
                    name="precio"
                    onChange={handleChange}
                    value={producto.precio}
                    type="number"
                    min={1}
                    required
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row></Row>
            <Row>
              <Col sm="6">
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
                    <option value={false}>No Activo</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <div className="Container-modal-buttons">
              <Button type="submit" size="sm" color="primary">
                Guardar
              </Button>
              <Button size="sm" color="danger" onClick={cerrarModal}>
                Cerrar
              </Button>
            </div>
          </form>
        </ModalBody>
        <ModalFooter></ModalFooter>
      </Modal>
    </>
  );
};

export default Producto;
