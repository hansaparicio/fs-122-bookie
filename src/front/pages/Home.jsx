import React, { useEffect } from "react"

import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Home = () => {

	const { store, dispatch } = useGlobalReducer()

	const loadMessage = async () => {
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL

			if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined in .env file")

			const response = await fetch(backendUrl + "/api/hello")
			const data = await response.json()

			if (response.ok) dispatch({ type: "set_hello", payload: data.message })

			return data

		} catch (error) {
			if (error.message) throw new Error(
				`Could not fetch the message from the backend.
				Please check if the backend is running and the backend port is public.`
			);
		}

	}

	useEffect(() => {
		loadMessage()
	}, [])

	return (


		<div className="d-flex justify-content-center align-items-center vh-100">
			<div className="card p-4" style={{ width: "350px" }}>
				<form>
					<div className="mb-3">
						<label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
						<input
							type="email"
							className="form-control"
							id="exampleInputEmail1"
							aria-describedby="emailHelp"
							required
						/>
						<div id="emailHelp" className="form-text">
							We'll never share your email with anyone else.
						</div>
					</div>

					<div className="mb-3">
						<label htmlFor="exampleInputPassword1" className="form-label">Password</label>
						<input
							type="password"
							className="form-control"
							id="exampleInputPassword1"
							required
						/>
					</div>

					<div className="mb-3 form-check">
						<input
							type="checkbox"
							className="form-check-input"
							id="exampleCheck1"
						/>
						<label className="form-check-label" htmlFor="exampleCheck1">
							Remember me
						</label>
					</div>

					<button type="submit" className="btn btn-primary w-100">Log in</button>
					<button type="submit" className="btn btn-primary w-100 mt-2">Sign up</button>
				</form>

			</div>
		</div>

	);
}; 