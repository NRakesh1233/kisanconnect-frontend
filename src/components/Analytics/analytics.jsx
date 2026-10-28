import "./analytics.css";

export default function AnalyticsSection() {
    return (
        <section className="analytics-section">

            {/* Revenue Analytics */}

            <div className="analytics-card revenue-card">

                <div className="card-header">

                    <h3>Revenue Analytics</h3>

                    <select>
                        <option>Last 12 Months</option>
                        <option>Last 6 Months</option>
                    </select>

                </div>

                <div className="bar-chart">

                    <div className="bar h25">
                        <span>₹820k</span>
                    </div>

                    <div className="bar h35">
                        <span>₹1.1M</span>
                    </div>

                    <div className="bar h65">
                        <span>₹2.4M</span>
                    </div>

                    <div className="bar active h100">
                        <span>₹3.8M</span>
                    </div>

                    <div className="bar h65"></div>

                    <div className="bar h75"></div>

                    <div className="bar h50"></div>

                    <div className="bar h60"></div>

                </div>

                <div className="months">

                    <span>Jan</span>
                    <span>Feb</span>
                    <span>Mar</span>
                    <span>Apr</span>
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>

                </div>

            </div>

            {/* Pie Chart */}

            <div className="analytics-card">

                <h3>Sales by Category</h3>

                <div className="pie-wrapper">

                    <svg
                        className="pie-chart"
                        viewBox="0 0 36 36"
                    >

                        <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="transparent"
                            stroke="#e3e2e0"
                            strokeWidth="4"
                        />

                        <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="transparent"
                            stroke="#23501e"
                            strokeWidth="4"
                            strokeDasharray="60 100"
                        />

                        <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="transparent"
                            stroke="#4a6640"
                            strokeWidth="4"
                            strokeDasharray="25 100"
                            strokeDashoffset="-60"
                        />

                        <circle
                            cx="18"
                            cy="18"
                            r="16"
                            fill="transparent"
                            stroke="#733600"
                            strokeWidth="4"
                            strokeDasharray="15 100"
                            strokeDashoffset="-85"
                        />

                    </svg>

                    <div className="pie-center">
                        <span>100%</span>
                    </div>

                </div>

                <ul className="category-list">

                    <li>

                        <div className="category-name">

                            <span className="dot grains"></span>

                            Grains

                        </div>

                        <strong>60%</strong>

                    </li>

                    <li>

                        <div className="category-name">

                            <span className="dot fruits"></span>

                            Fruits

                        </div>

                        <strong>25%</strong>

                    </li>

                    <li>

                        <div className="category-name">

                            <span className="dot vegetables"></span>

                            Vegetables

                        </div>

                        <strong>15%</strong>

                    </li>

                </ul>

            </div>

        </section>
    );
}