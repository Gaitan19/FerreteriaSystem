import { useEffect, useState, useCallback } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,LinearScale,BarElement,Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { exportToPDF } from '../utils/exportHelpers';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const data_inicio_donut = {
    labels: ['Sin resultados'],
    datasets: [
        {
            data: [0],
            backgroundColor: [
                'rgba(255, 99, 132, 0.2)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1,
        },
    ],
};


const data_inicio_bar = {
    labels: ['Sin resultados'],
    datasets: [
        {
            label: 'Cantidad',
            data: [0],
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
    ],
};

const DashBoard = () => {

    const [config, setConfig] = useState({})
    const [dataDonut, setDataDonut] = useState(data_inicio_donut)
    const [dataBar, setDataBar] = useState(data_inicio_bar)
    
    // New state for filters
    const [dateRange, setDateRange] = useState("Esta semana")
    const [productSort, setProductSort] = useState("most")
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [showDatePicker, setShowDatePicker] = useState(false)

    const optionsBar = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            }
        }
    };

    const obtenerConfiguracion = useCallback(() => {
        let url = "api/utilidad/Dashboard?dateRange=" + encodeURIComponent(dateRange) + "&productSort=" + productSort;
        
        if (dateRange === "Elegir rango") {
            const formatDate = (date) => date.toISOString().split('T')[0]; // YYYY-MM-DD format
            url += "&startDate=" + formatDate(startDate) + "&endDate=" + formatDate(endDate);
        }

        fetch(url)
            .then((response) => {
                return response.ok ? response.json() : Promise.reject(response);
            })
            .then((dataJson) => {
                let d = dataJson;

                let lblsBar = d.ventasporDias.map((item) => { return item.fecha })
                let dtaBar = d.ventasporDias.map((item) => { return item.total } )

                let lblsDonut = d.productosVendidos.map((item) => { return item.producto })
                let dtaDonut = d.productosVendidos.map((item) => { return item.total })


                let modeloBar = {
                    labels: lblsBar,
                    datasets: [
                        {
                            label: 'Cantidad',
                            data: dtaBar,
                            backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        },
                    ]
                };

                let modeloDonut = {
                    labels: lblsDonut,
                    datasets: [
                        {
                            data: dtaDonut,
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255, 99, 132, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)'
                            ],
                            borderWidth: 1
                        },
                    ],
                }

                if (d.ventasporDias.length < 1)
                    setDataBar(data_inicio_bar)
                else
                    setDataBar(modeloBar)

                if (d.productosVendidos.length < 1)
                    setDataDonut(data_inicio_donut)
                else
                    setDataDonut(modeloDonut)
                
                setConfig(d)
            }).catch((error) => {
                console.log("error")
            })

    }, [dateRange, productSort, startDate, endDate])

    const handleDateRangeChange = (value) => {
        setDateRange(value);
        setShowDatePicker(value === "Elegir rango");
    };

    const handleProductSortChange = (value) => {
        setProductSort(value);
    };

    const exportChartsToPDF = () => {
        try {
            // Prepare data for PDF export
            const salesData = config.ventasporDias || [];
            const productsData = config.productosVendidos || [];

            // Export sales chart data
            const salesColumns = [
                { header: 'Fecha', accessor: (row) => row.fecha },
                { header: 'Cantidad', accessor: (row) => row.total }
            ];

            const productsColumns = [
                { header: 'Producto', accessor: (row) => row.producto },
                { header: 'Total', accessor: (row) => row.total }
            ];

            // Create a combined PDF with both charts
            const fileName = `Dashboard_${dateRange.replace(' ', '_')}_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}`;
            
            // For now, we'll export the data tables. In a future iteration, we could add chart images.
            exportToPDF([...salesData, ...productsData], 
                [...salesColumns, ...productsColumns], 
                fileName);
                
        } catch (error) {
            console.error('Error exporting to PDF:', error);
        }
    };

    useEffect(() => {
        obtenerConfiguracion()
    }, [obtenerConfiguracion])

    return (
        <>
            <div className="row">

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Cantidad de Ventas</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{ (config.totalVentas !== undefined) ? config.totalVentas : "0" }</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-shopping-basket fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Ingresos por Ventas</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{(config.totalIngresos !== undefined) ? config.totalIngresos : "0"}</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-info shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Total Productos
                                    </div>
                                    <div className="row no-gutters align-items-center">
                                        <div className="col-auto">
                                            <div className="h5 mb-0 mr-3 font-weight-bold text-gray-800">{(config.totalProductos !== undefined) ? config.totalProductos : "0"}</div>
                                        </div>
                                        <div className="col">
                                           
                                        </div>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-clipboard-list fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-warning shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Total Categorias
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">{(config.totalCategorias !== undefined) ? config.totalCategorias : "0"}</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-tags fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                {/* Filter Controls Row */}
                <div className="col-12 mb-3">
                    <div className="card shadow">
                        <div className="card-header py-3 bg-light">
                            <div className="row align-items-center">
                                <div className="col-md-3">
                                    <label className="font-weight-bold text-dark mb-1">Rango de fechas:</label>
                                    <select 
                                        className="form-control form-control-sm"
                                        value={dateRange}
                                        onChange={(e) => handleDateRangeChange(e.target.value)}
                                    >
                                        <option value="Esta semana">Esta semana</option>
                                        <option value="Este mes">Este mes</option>
                                        <option value="Elegir rango">Elegir rango</option>
                                    </select>
                                </div>
                                
                                {showDatePicker && (
                                    <>
                                        <div className="col-md-2">
                                            <label className="font-weight-bold text-dark mb-1">Fecha inicio:</label>
                                            <DatePicker
                                                selected={startDate}
                                                onChange={(date) => setStartDate(date)}
                                                className="form-control form-control-sm"
                                                dateFormat="dd/MM/yyyy"
                                            />
                                        </div>
                                        <div className="col-md-2">
                                            <label className="font-weight-bold text-dark mb-1">Fecha fin:</label>
                                            <DatePicker
                                                selected={endDate}
                                                onChange={(date) => setEndDate(date)}
                                                className="form-control form-control-sm"
                                                dateFormat="dd/MM/yyyy"
                                            />
                                        </div>
                                    </>
                                )}
                                
                                <div className="col-md-3">
                                    <label className="font-weight-bold text-dark mb-1">Productos:</label>
                                    <select 
                                        className="form-control form-control-sm"
                                        value={productSort}
                                        onChange={(e) => handleProductSortChange(e.target.value)}
                                    >
                                        <option value="most">Más vendidos</option>
                                        <option value="least">Menos vendidos</option>
                                    </select>
                                </div>
                                
                                <div className="col-md-2">
                                    <label className="font-weight-bold text-dark mb-1">&nbsp;</label>
                                    <button 
                                        className="btn btn-primary btn-sm d-block w-100"
                                        onClick={exportChartsToPDF}
                                    >
                                        <i className="fas fa-file-pdf mr-1"></i>Exportar PDF
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-xl-8 col-lg-7">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between bg-primary">
                            <h6 className="m-0 font-weight-bold text-white">
                                Ventas - {dateRange === "Elegir rango" ? `${startDate.toLocaleDateString()} a ${endDate.toLocaleDateString()}` : dateRange}
                            </h6>
                        </div>
                        <div className="card-body">
                            <div style={{height:350}}>
                                <Bar options={optionsBar} data={dataBar} />
                            </div>
                            
                        </div>
                    </div>
                </div>
                <div className="col-xl-4 col-lg-5">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between bg-primary">
                            <h6 className="m-0 font-weight-bold text-white">
                                Productos {productSort === "most" ? "más vendidos" : "menos vendidos"}
                            </h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: 350 }}>
                                <Doughnut options={optionsBar} data={dataDonut} />
                            </div>
                            
                        </div>
                    </div>
                </div>

               
            </div>
        </>
    )
}

export default DashBoard;