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
import { useContext, useEffect, useState, useCallback } from 'react';
import './css/Venta.css';
import { UserContext } from '../context/UserProvider';
import { generateCode } from '../utils/generateCode';
import printJS from 'print-js';
import Ticket from '../componentes/Ticket';


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
  
  // New fields for payment
  const [tipoPago, setTipoPago] = useState('Cordobas');
  const [numeroRuc, setNumeroRuc] = useState('');
  const [montoPago, setMontoPago] = useState(0);
  const [vuelto, setVuelto] = useState(0);
  const [tipoCambio, setTipoCambio] = useState(0);
  
  // Estado para la última venta (para imprimir)
  const [ultimaVenta, setUltimaVenta] = useState({});

  const reestablecer = () => {
    setDocumentoCliente(generateCode());
    setNombreCliente('');
    setTipoDocumento('Boleta');
    setProductos([]);
    setTotal(0);
    setSubTotal(0);
    setIgv(0);
    setTipoPago('Cordobas');
    setNumeroRuc('');
    setMontoPago(0);
    setVuelto(0);
    setTipoCambio(0);
  };

  const obtenerProductos = async () => {
    let response = await fetch('api/producto/Lista');

    if (response.ok) {
      let data = await response.json();
      setTempProducts(() => data);
    }
  };

  const calcularVuelto = useCallback((pagoCliente) => {
    // For Transferencia, no change is calculated (exact payment)
    if (tipoPago === 'Transferencia') {
      setVuelto(0);
      return;
    }
    
    // For Dolares, don't auto-calculate - let user enter manually
    if (tipoPago === 'Dolares') {
      return;
    }
    
    // For Cordobas, calculate change normally
    const totalVenta = parseFloat(total) || 0;
    const pago = parseFloat(pagoCliente) || 0;
    const cambio = pago - totalVenta;
    setVuelto(cambio >= 0 ? cambio : 0);
  }, [tipoPago, total]);

  useEffect(() => {
    obtenerProductos();
  }, []);

  // Recalculate change when payment type changes
  useEffect(() => {
    if (tipoPago === 'Transferencia') {
      setVuelto(0);
    } else if (tipoPago === 'Dolares') {
      // Don't auto-calculate for dollars, reset to 0
      setVuelto(0);
      setTipoCambio(0);
    } else if (montoPago > 0) {
      // For Cordobas, recalculate automatically
      calcularVuelto(montoPago);
    }
  }, [tipoPago, total, montoPago, calcularVuelto]);

  //para obtener la lista de sugerencias
  const onSuggestionsFetchRequested = ({ value }) => {
    fetch('api/venta/Productos/' + value)
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
            return null;
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
    let listaproductos = productos.filter((p) => p.idProducto !== id);
    const tempProductsCart = productsCart.filter(
      (item) => item[0].idProducto !== id
    );
    setProductsCart(() => tempProductsCart);
    setProductos(listaproductos);
    calcularTotal(listaproductos);
  };

  const calcularTotal = (arrayProductos) => {
    let st = 0;  // subtotal sin IVA
    let imp = 0; // IVA
    let t = 0;   // total con IVA

    if (arrayProductos.length > 0) {
        arrayProductos.forEach((p) => {
            st += p.total   // aquí p.total = precio * cantidad (sin IVA)
        })

        imp = st * 0.15    // IVA del 15% en Nicaragua
        t = st + imp       // Total con IVA
    }

    setSubTotal(st.toFixed(2))
    setIgv(imp.toFixed(2))
    setTotal(t.toFixed(2))
}
;

  // Función para obtener detalles de una venta específica
  const obtenerDetalleVenta = async (numeroVenta) => {
    try {
      let options = { year: 'numeric', month: '2-digit', day: '2-digit' };
      let fecha = new Date().toLocaleDateString('es-PE', options);
      
      const response = await fetch(
        `api/venta/Listar?buscarPor=numero&numeroVenta=${numeroVenta}&fechaInicio=${fecha}&fechaFin=${fecha}`
      );
      
      if (response.ok) {
        const dataJson = await response.json();
        if (dataJson.length > 0) {
          setUltimaVenta(dataJson[0]);
          console.log('Detalle de venta obtenido:', dataJson[0]);
          return dataJson[0];
        }
      }
      return null;
    } catch (error) {
      console.error('Error al obtener detalle de venta:', error);
      return null;
    }
  };

  // Función para imprimir el ticket (igual que en HistorialVenta)
   const imprimirTicket = () => {
     printJS({
       printable: "ticket-impresion",
       type: "html",
       style: `
         .ticket {
        .ticket {
     font-family: 'Courier New', monospace;
     font-size: 12px;
     line-height: 1.4;
     margin: 0 auto;
     padding: 0;
     text-align: left;
     width: 80mm; /* Ancho específico del ticket */
     word-wrap: break-word;
 }
 
 .ticket__header,
 .ticket__body,
 .ticket__footer {
     margin-bottom: 5px;
     text-align: center; /* Centrado en la sección */
 }
 
 .ticket__title {
     font-size: 14px;
     font-weight: bold;
     margin-bottom: 5px;
     text-transform: uppercase;
 }
 
 .ticket__address {
     font-size: 10px;
     margin: 3px 0;
 }
 
 .ticket__separator {
     border: none;
     border-top: 1px dashed #000;
     margin: 3px 0;
 }
 
 .ticket__info {
     font-size: 12px;
     margin: 2px 0;
     text-align: left;
 }
 
 .ticket__table {
     border-collapse: collapse;
     font-size: 12px;
     margin-top: 5px;
     width: 100%;
 }
 
 .ticket__table-header,
 .ticket__table-cell {
     padding: 0;
 }
 
 .ticket__table-header {
     font-weight: bold;
     text-align: left;
 }
 
 .ticket__table-cell {
     overflow: hidden;
     text-align: left;
     text-overflow: ellipsis;
     white-space: nowrap;
 }
 
 .ticket__table-cell--center {
     text-align: center;
 }
 
 .ticket__table-cell--right {
     text-align: right;
 }
 
 .ticket__footer {
     border-top: 1px dashed #000;
     font-size: 10px;
     padding-top: 5px;
     text-align: center;
 }
 
 .ticket__footer-title {
     font-size: 12px;
     font-weight: bold;
 }
 
 @media print {
     body {
         align-items: flex-start;
         display: flex;
         justify-content: center; /* Centrar el ticket en la página */
         margin: 0;
         padding: 0;
     }
 
     .ticket {
         font-size: 12px; /* Tamaño adecuado para impresión térmica */
         margin: 0;
         page-break-inside: avoid; /* Evitar que el ticket se parta */
         width: 80mm; /* Mantener el tamaño exacto */
     }
 }
 
       `,
     });
   };

  const terminarVenta = () => {
    if (productos.length < 1) {
      Swal.fire('Opps!', 'No existen productos', 'error');
      return;
    }

    // Validation for required fields
    if (!tipoPago) {
      Swal.fire('Opps!', 'Debe seleccionar un tipo de pago', 'error');
      return;
    }

    if (montoPago <= 0) {
      Swal.fire('Opps!', 'Debe ingresar el monto que paga el cliente', 'error');
      return;
    }

    // For Dolares payment, validate exchange rate and use conversion
    if (tipoPago === 'Dolares') {
      if (tipoCambio <= 0) {
        Swal.fire('Opps!', 'Debe ingresar un tipo de cambio válido (mayor a 0)', 'error');
        return;
      }
      
      const montoConvertido = parseFloat(montoPago) * parseFloat(tipoCambio);
      if (montoConvertido < parseFloat(total)) {
        Swal.fire('Opps!', 'El monto pagado debe ser mayor o igual al total de la venta', 'error');
        return;
      }
    } else {
      // For other payment types, validate normally
      if (montoPago < parseFloat(total)) {
        Swal.fire('Opps!', 'El monto pagado debe ser mayor o igual al total de la venta', 'error');
        return;
      }
    }

    let venta = {
      documentoCliente: documentoCliente,
      nombreCliente: nombreCliente,
      tipoDocumento: tipoDocumento,
      idUsuario: JSON.parse(user).idUsuario,
      subTotal: parseFloat(subTotal),
      igv: parseFloat(igv),
      total: parseFloat(total),
      tipoPago: tipoPago,
      numeroRuc: numeroRuc || '',
      montoPago: parseFloat(montoPago),
      vuelto: parseFloat(vuelto),
      listaProductos: productos,
    };

    setProductsCart([]);

    fetch('api/venta/Registrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(venta),
    })
      .then((response) => {
        return response.ok ? response.json() : Promise.reject(response);
      })
      .then(async (dataJson) => {
        reestablecer();
        var data = dataJson;
        
        // Mostrar mensaje de éxito con opción de imprimir
        const result = await Swal.fire({
          title: 'Venta Creada!',
          text: `Número de venta: ${data.numeroDocumento}`,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Imprimir Ticket',
          cancelButtonText: 'Cerrar',
          confirmButtonColor: '#4e73df',
          cancelButtonColor: '#6c757d'
        });

        // Si el usuario quiere imprimir
        if (result.isConfirmed) {
          // Obtener los detalles de la venta para imprimir
          const detalleVenta = await obtenerDetalleVenta(data.numeroDocumento);
          if (detalleVenta) {
            // Dar un pequeño tiempo para que se rendericen los elementos
            setTimeout(() => {
              imprimirTicket();
            }, 500);
          } else {
            Swal.fire('Error', 'No se pudo obtener los detalles para imprimir', 'error');
          }
        }

        obtenerProductos();
      })
      .catch((error) => {
        Swal.fire('Opps!', 'No se pudo crear la venta', 'error');
        console.log('No se pudo enviar la venta ', error);
      });
  };

  return (
    <>
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
                  <Row>
                    <Col sm={6}>
                      <FormGroup>
                        <Label>Número RUC (Opcional)</Label>
                        <Input
                          bsSize="sm"
                          value={numeroRuc}
                          onChange={(e) => setNumeroRuc(e.target.value)}
                          placeholder="RUC del cliente"
                        />
                      </FormGroup>
                    </Col>
                    <Col sm={6}>
                      <FormGroup>
                        <Label>Tipo de Pago <span style={{color: 'red'}}>*</span></Label>
                        <Input
                          type="select"
                          bsSize="sm"
                          value={tipoPago}
                          onChange={(e) => setTipoPago(e.target.value)}
                        >
                          <option value="Cordobas">Córdobas</option>
                          <option value="Dolares">Dólares</option>
                          <option value="Transferencia">Transferencia</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>
                  {tipoPago === 'Dolares' && (
                    <Row>
                      <Col sm={6}>
                        <FormGroup>
                          <Label>Tipo de Cambio (C$ por US$) <span style={{color: 'red'}}>*</span></Label>
                          <Input
                            type="number"
                            step="0.01"
                            bsSize="sm"
                            value={tipoCambio}
                            onChange={(e) => setTipoCambio(e.target.value)}
                            placeholder="Ej: 36.6"
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  )}
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
                  <Row className="mb-2">
                    <Col sm={12}>
                      <InputGroup size="sm">
                        <InputGroupText>Total:C$</InputGroupText>
                        <Input disabled value={total} />
                      </InputGroup>
                    </Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={12}>
                      <InputGroup size="sm">
                        <InputGroupText>Paga con <span style={{color: 'red'}}>*</span>:</InputGroupText>
                        <Input 
                          type="number" 
                          step="0.01"
                          value={montoPago} 
                          onChange={(e) => {
                            const valor = e.target.value;
                            setMontoPago(valor);
                            calcularVuelto(valor);
                          }}
                          placeholder="Monto que paga el cliente"
                        />
                      </InputGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col sm={12}>
                      <InputGroup size="sm">
                        <InputGroupText>
                          Vuelto:{tipoPago === 'Dolares' ? '$' : 'C$'}
                        </InputGroupText>
                        <Input 
                          disabled={tipoPago !== 'Dolares'} 
                          value={vuelto.toFixed(2)} 
                          onChange={(e) => {
                            if (tipoPago === 'Dolares') {
                              setVuelto(parseFloat(e.target.value) || 0);
                            }
                          }}
                          type="number"
                          step="0.01"
                        />
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

      {/* Ticket oculto para impresión */}
      <div style={{ display: "none" }}>
        <Ticket detalleVenta={ultimaVenta} />
      </div>
    </>
  );
};

export default Venta;
