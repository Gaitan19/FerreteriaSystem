import {
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Row,
  Table,
  Button,
} from 'reactstrap';
import Swal from 'sweetalert2';
import Autosuggest from 'react-autosuggest';
import { useContext, useEffect, useState } from 'react';
import './css/Venta.css';
import { UserContext } from '../context/UserProvider';
import { generateCode } from '../utils/generateCode';

const modelo = {
  nombre: '',
  correo: '',
  idRolNavigation: {
    idRol: 0,
    descripcion: '',
  },
};

const Venta = () => {
  const { user } = useContext(UserContext);

  const [a_Productos, setA_Productos] = useState([]);
  const [a_Busqueda, setA_Busqueda] = useState('');

  const [documentoCliente, setDocumentoCliente] = useState(generateCode());
  const [nombreCliente, setNombreCliente] = useState('');

  const [tipoDocumento, setTipoDocumento] = useState('Boleta');
  const [productos, setProductos] = useState([]);
  const [productsCart, setProductsCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [igv, setIgv] = useState(0);
  const [tempProducts, setTempProducts] = useState([]);
  const [alreadyProductos, setAlreadyProductos] = useState(false);

  const reestablecer = () => {
    setDocumentoCliente(generateCode());
    setNombreCliente('');
    setTipoDocumento('Boleta');
    setProductos([]);
    setTotal(0);
    setSubTotal(0);
    setIgv(0);
  };

  const obtenerProductos = async () => {
    let response = await fetch('api/producto/Lista');

    if (response.ok) {
      let data = await response.json();
      setTempProducts(() => data);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  //para obtener la lista de sugerencias
  const onSuggestionsFetchRequested = ({ value }) => {
    const api = fetch('api/venta/Productos/' + value)
      .then((response) => {
        return response.ok ? response.json() : Promise.reject(response);
      })
      .then((dataJson) => {
        let isInCart = true;
        dataJson.forEach((item) => {
          productsCart.forEach((tempItem) => {
            if (tempItem[0].idProducto === item.idProducto) {
              isInCart = false;
            }
          });
        });

        setA_Productos(() =>
          dataJson.filter((item) => {
            if (!alreadyProductos) {
              obtenerProductos();
              setAlreadyProductos((prev) => !prev);
            }
            const tempStock = tempProducts.filter(
              (item2) => item2.idProducto === item.idProducto
            );
            
            if (
              item.precio > 0 &&
              isInCart &&
              tempStock[0].stock > 0 &&
              tempStock[0].esActivo
            ) {
              return item;
            }
          })
        );
      })
      .catch((error) => {
        console.log('No se pudo obtener datos, mayor detalle: ', error);
      });
  };

  //funcion que nos permite borrar las sugerencias
  const onSuggestionsClearRequested = () => {
    setA_Productos([]);
  };

  //devuelve el texto que se mostrara en la caja de texto del autocomplete cuando seleccionas una sugerencia (item)
  const getSuggestionValue = (sugerencia) => {
    return (
      sugerencia.codigo +
      ' - ' +
      sugerencia.marca +
      ' - ' +
      sugerencia.descripcion
    );
  };

  //como se debe mostrar las sugerencias - codigo htmlf
  const renderSuggestion = (sugerencia) => (
    <span>
      {sugerencia.codigo +
        ' - ' +
        sugerencia.marca +
        ' - ' +
        sugerencia.descripcion}
    </span>
  );

  //evento cuando cambie el valor del texto de busqueda
  const onChange = (e, { newValue }) => {
    setA_Busqueda(newValue);
  };

  const inputProps = {
    placeholder: 'Buscar producto',
    value: a_Busqueda,
    onChange,
  };

  const sugerenciaSeleccionada = async (
    event,
    { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }
  ) => {
    Swal.fire({
      title: suggestion.marca + ' - ' + suggestion.descripcion,
      text: 'Ingrese la cantidad',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off',
      },
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Volver',
      showLoaderOnConfirm: true,
      preConfirm: (inputValue) => {
        obtenerProductos();

        if (isNaN(parseFloat(inputValue))) {
          setA_Busqueda('');
          Swal.showValidationMessage('Debe ingresar un valor númerico');
        } else {
          const tempStock = tempProducts.filter(
            (item) => item.idProducto === suggestion.idProducto
          );

          if (parseInt(inputValue) > tempStock[0].stock) {
            setA_Busqueda('');
            Swal.showValidationMessage(
              `La cantidad excede al stock:${tempStock[0].stock}`
            );
          } else if (parseInt(inputValue) < 1) {
            setA_Busqueda('');
            Swal.showValidationMessage(`La cantidad debe ser mayor a "0"`);
          } else {
            setProductsCart(() => [...productsCart, tempStock]);

            let producto = {
              idProducto: suggestion.idProducto,
              descripcion: suggestion.descripcion,
              cantidad: parseInt(inputValue),
              precio: suggestion.precio,
              total: suggestion.precio * parseFloat(inputValue),
            };
            let arrayProductos = [];
            arrayProductos.push(...productos);
            arrayProductos.push(producto);

            setProductos((anterior) => [...anterior, producto]);
            calcularTotal(arrayProductos);
          }
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        setA_Busqueda('');
      } else {
        setA_Busqueda('');
      }
    });
  };

  const eliminarProducto = (id) => {
    let listaproductos = productos.filter((p) => p.idProducto != id);
    const tempProductsCart = productsCart.filter(
      (item) => item[0].idProducto !== id
    );
    setProductsCart(() => tempProductsCart);
    setProductos(listaproductos);
    calcularTotal(listaproductos);
  };

  const calcularTotal = (arrayProductos) => {
    let t = 0;
    let st = 0;
    let imp = 0;
    let ti = 0;

    if (arrayProductos.length > 0) {
      arrayProductos.forEach((p) => {
        t = p.total + t;
      });

      st = t / 1.15;
      imp = t - st;
      ti = t + imp;
    }

    //Monto Base = (Monto con IGV) / (1.18)

    //IGV = (Monto con IGV) – (Monto Base)

    setSubTotal(t.toFixed(2));
    setIgv(imp.toFixed(2));
    // setTotal(ti.toFixed(2));
    setTotal(t.toFixed(2));
  };

  const terminarVenta = () => {
    if (productos.length < 1) {
      Swal.fire('Opps!', 'No existen productos', 'error');
      return;
    }

    let venta = {
      documentoCliente: documentoCliente,
      nombreCliente: nombreCliente,
      tipoDocumento: tipoDocumento,
      idUsuario: JSON.parse(user).idUsuario,
      subTotal: parseFloat(subTotal),
      igv: parseFloat(igv),
      total: parseFloat(total),
      listaProductos: productos,
    };

    setProductsCart([]);

    const api = fetch('api/venta/Registrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(venta),
    })
      .then((response) => {
        return response.ok ? response.json() : Promise.reject(response);
      })
      .then((dataJson) => {
        reestablecer();
        var data = dataJson;
        Swal.fire(
          'Venta Creada!',
          'Numero de venta : ' + data.numeroDocumento,
          'success'
        );
        obtenerProductos();
      })
      .catch((error) => {
        Swal.fire('Opps!', 'No se pudo crear la venta', 'error');
        console.log('No se pudo enviar la venta ', error);
      });
  };

  return (
    <Row>
      <Col sm={8}>
        <Row className="mb-2">
          <Col sm={12}>
            <Card>
              <CardHeader
                style={{ backgroundColor: '#4e73df', color: 'white' }}
              >
                Cliente
              </CardHeader>
              <CardBody>
                <Row>
                  <Col sm={6}>
                    <FormGroup>
                      <Label>Cod Documento</Label>
                      <Input
                        bsSize="sm"
                        value={documentoCliente}
                        onChange={(e) => setDocumentoCliente(e.target.value)}
                        readOnly
                      />
                    </FormGroup>
                  </Col>
                  <Col sm={6}>
                    <FormGroup>
                      <Label>Nombre</Label>
                      <Input
                        bsSize="sm"
                        value={nombreCliente}
                        onChange={(e) => setNombreCliente(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <Card>
              <CardHeader
                style={{ backgroundColor: '#4e73df', color: 'white' }}
              >
                Productos
              </CardHeader>
              <CardBody>
                <Row className="mb-2">
                  <Col sm={12}>
                    <FormGroup>
                      <Autosuggest
                        suggestions={a_Productos}
                        onSuggestionsFetchRequested={
                          onSuggestionsFetchRequested
                        }
                        onSuggestionsClearRequested={
                          onSuggestionsClearRequested
                        }
                        getSuggestionValue={getSuggestionValue}
                        renderSuggestion={renderSuggestion}
                        inputProps={inputProps}
                        onSuggestionSelected={sugerenciaSeleccionada}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col sm={12}>
                    <Table striped size="sm">
                      <thead>
                        <tr>
                          <th></th>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productos.length < 1 ? (
                          <tr>
                            <td colSpan="5">Sin productos</td>
                          </tr>
                        ) : (
                          productos.map((item) => (
                            <tr key={item.idProducto}>
                              <td>
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() =>
                                    eliminarProducto(item.idProducto)
                                  }
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </Button>
                              </td>
                              <td>{item.descripcion}</td>
                              <td>{item.cantidad}</td>
                              <td>C${item.precio}</td>
                              <td>C${item.total}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Col>

      <Col sm={4}>
        <Row className="mb-2">
          <Col sm={12}>
            <Card>
              <CardHeader
                style={{ backgroundColor: '#4e73df', color: 'white' }}
              >
                Detalle
              </CardHeader>
              <CardBody>
                <Row className="mb-2">
                  <Col sm={12}>
                    <InputGroup size="sm">
                      <InputGroupText>Tipo:</InputGroupText>
                      <Input
                        type="select"
                        value={tipoDocumento}
                        onChange={(e) => setTipoDocumento(e.target.value)}
                      >
                        <option value="Boleta">Boleta</option>
                        <option value="Factura">Factura</option>
                      </Input>
                    </InputGroup>
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={12}>
                    <InputGroup size="sm">
                      <InputGroupText>Sub Total:C$</InputGroupText>
                      <Input disabled value={subTotal} />
                    </InputGroup>
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={12}>
                    <InputGroup size="sm" className="Input-impuestos">
                      <InputGroupText>IGV (15%):</InputGroupText>
                      <Input disabled value={igv} />
                    </InputGroup>
                  </Col>
                </Row>
                <Row>
                  <Col sm={12}>
                    <InputGroup size="sm">
                      <InputGroupText>Total:C$</InputGroupText>
                      <Input disabled value={total} />
                    </InputGroup>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col sm={12}>
            <Card>
              <CardBody>
                <Button color="success" block onClick={terminarVenta}>
                  <i className="fas fa-money-check"></i> Terminar Venta
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default Venta;
