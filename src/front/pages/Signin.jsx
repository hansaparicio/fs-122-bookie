export const Signin = () => {
    return (

        <>
            <h1>Sign In Page</h1>
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
        </>
    );
}