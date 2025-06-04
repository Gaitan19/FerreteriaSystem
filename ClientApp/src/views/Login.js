import { useContext, useEffect, useState } from "react"
import { UserContext } from "../context/UserProvider"
import Swal from 'sweetalert2'
import { Navigate } from "react-router-dom"
import { FaEyeSlash, FaEye } from 'react-icons/fa';
import { cifrarPassword, decifrarPassword } from "../utils/cifrado";

const Login = () => {

    const [_correo, set_Correo] = useState("")
    const [_clave, set_Clave] = useState("")
    const { user, iniciarSession } = useContext(UserContext)
    const [visiblePassword, setVisiblePassword] = useState(false);
    const [usuarios, setUsuarios] = useState([]);

    const obtenerUsuarios = async () => {
        let response = await fetch("api/usuario/Lista");

        if (response.ok) {
            let data = await response.json()
            const tempData = [];
            data.forEach((item) => {
                if (item.esActivo) {
                    item.clave = decifrarPassword(item.clave);
                    tempData.push(item)
                }
            })
            setUsuarios(() => tempData)
        }

    }

    useEffect(() => {
        obtenerUsuarios();
    }, [])


    if (user != null) {
        return <Navigate to="/" />
    }



    const handleVisiblePassword = () => {
        setVisiblePassword((preVisible) => !preVisible);
    };


    const handleSubmit = (event) => {
        event.preventDefault();
        try {

            let request = {
                correo: _correo,
                clave: _clave
            }
            let data;
            let foundedData = false;
            let userFounded = false;


            usuarios.forEach((item) => {
                if (item.correo === _correo) {
                    userFounded = true
                }

                if (item.clave === _clave && item.correo === _correo) {
                    data = item;
                    foundedData = true;

                }
            })


            if (foundedData) {
                data.clave = cifrarPassword(data.clave);
                iniciarSession(data)
            }
            else if (!userFounded) {
                Swal.fire(
                    'Opps!',
                    'Correo no encontrado',
                    'error'
                )
            } else {
                Swal.fire(
                    'Opps!',
                    'Contraseña incorrecta',
                    'error'
                )
            }
        } catch (error) {
            Swal.fire(
                'Opps!',
                'No se pudo iniciar sessión',
                'error'
            )
        }



       
    }

    return (
        <div className="container">

            <div className="row justify-content-center">

                <div className="col-xl-10 col-lg-12 col-md-9">

                    <div className="card o-hidden border-0 shadow-lg my-5">
                        <div className="card-body p-0">

                            <div className="row Login-container-image">
                                <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                                <div className="col-lg-6">
                                    <div className="p-5">
                                        <div className="text-center">
                                            <h1 className="h4 text-gray-900 mb-4">Bienvenido</h1>
                                        </div>
                                        <form className="user" onSubmit={handleSubmit}>
                                            <div className="form-group">
                                                <input type="email" className="form-control form-control-user" aria-describedby="emailHelp" placeholder="Correo"
                                                    value={_correo}
                                                    onChange={(e) => set_Correo(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group Input-password">
                                                <input type={`${visiblePassword ? 'text' : 'password'}`} className="form-control form-control-user Input-login" placeholder="Contraseña"
                                                    value={_clave}
                                                    onChange={(e) => set_Clave(e.target.value)}
                                                    required
                                                />
                                                <button className="Button-visible" type="button" onClick={handleVisiblePassword}>
                                                    {visiblePassword ? (
                                                        <FaEyeSlash className="Button-icon" />
                                                    ) : (
                                                        <FaEye className="Button-icon" />
                                                    )}
                                                </button>
                                            </div>
                                            <button type="submit" className="btn btn-primary btn-user btn-block"> Ingresar </button>

                                        </form>
                                        <hr></hr>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    )
}

export default Login