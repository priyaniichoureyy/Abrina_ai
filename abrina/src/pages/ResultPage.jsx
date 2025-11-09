import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/abrina_logo.jpg"; // ✅ your app logo path

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state || null;
  const [result, setResult] = useState(null);
  const reportRef = useRef();

  useEffect(() => {
    if (!navState) return;

    const normalize = () => {
      if (navState.result && typeof navState.result === "object") {
        return {
          isPoisonLikely: !!navState.result.isPoisonLikely,
          probablePoison: navState.result.probablePoison || "None detected",
          suggestedTests: Array.isArray(navState.result.suggestedTests)
            ? navState.result.suggestedTests
            : navState.result.suggestedTests
            ? [navState.result.suggestedTests]
            : [],
          confidence:
            typeof navState.result.confidence === "number"
              ? navState.result.confidence
              : parseInt(navState.result.confidence) || 0,
        };
      }

      return {
        isPoisonLikely: !!navState.isPoisonLikely,
        probablePoison: navState.probablePoison || "None detected",
        suggestedTests: Array.isArray(navState.suggestedTests)
          ? navState.suggestedTests
          : navState.suggestedTests
          ? [navState.suggestedTests]
          : [],
        confidence:
          typeof navState.confidence === "number"
            ? navState.confidence
            : parseInt(navState.confidence) || 0,
      };
    };

    const timer = setTimeout(() => {
      setResult(normalize());
    }, 1200);

    return () => clearTimeout(timer);
  }, [navState]);

  // ✅ Working PDF Download Logic
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    // Temporarily hide buttons before capture
    const buttons = reportRef.current.querySelectorAll("button");
    buttons.forEach((btn) => (btn.style.display = "none"));

    const canvas = await html2canvas(reportRef.current, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // Restore buttons after capture
    buttons.forEach((btn) => (btn.style.display = "inline-block"));

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    const caseId = navState.caseId || "UnknownCase";
    const role = navState.role || "general";
    const officer = navState.authorizedOfficer || "Dr. " + (navState.name || "Officer");

    // ✅ Header
    pdf.addImage(logo, "JPEG", 10, 10, 30, 30);
    pdf.setFontSize(18);
    pdf.setTextColor(30, 30, 30);
    pdf.text("Abrina Poison Detection Report", 50, 25);

    // ✅ Timestamp
    const currentDate = new Date().toLocaleString();
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Generated on: ${currentDate}`, 50, 33);

    // ✅ Report Body Image
    pdf.addImage(imgData, "PNG", 0, 45, pdfWidth, pdfHeight - 60);

    // ✅ Footer & Signature
    const footerY = pdfHeight - 10 > 260 ? 260 : pdfHeight + 35;
    pdf.setFontSize(11);
    pdf.setTextColor(40);
    pdf.text("_________________________", 20, footerY);

    // Digital signature in nice italic font
    pdf.setFont("times", "italic");
    pdf.setFontSize(14);
    pdf.text(officer, 20, footerY + 6);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text("Authorized Officer Signature", 20, footerY + 12);

    pdf.text("_________________________", 130, footerY);
    pdf.setFont("times", "italic");
    pdf.setFontSize(13);
    pdf.text("Forensic Department", 130, footerY + 6);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.text(
      "© 2025 Abrina AI — Confidential Poison Detection Report",
      40,
      footerY + 20
    );

    pdf.save(`${caseId}_${role}_report.pdf`);
  };

  if (!navState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100">
        <div className="bg-white shadow-xl p-8 rounded-2xl border border-blue-100 text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-2">Invalid Access</h1>
          <p className="text-gray-600 mb-6">
            Please complete the form before viewing results.
          </p>
          <button
            onClick={() => navigate("/explore")}
            className="bg-cyan-600 text-white py-2 px-5 rounded-lg hover:bg-cyan-700 transition"
          >
            Go to Explore
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-100 to-blue-100 flex justify-center items-center p-6">
      <div
        ref={reportRef}
        className="bg-white shadow-2xl rounded-2xl p-10 max-w-2xl w-full border border-blue-100 text-center"
      >
        <h1 className="text-4xl font-extrabold text-cyan-700 mb-6">
          Poisoning Analysis Report
        </h1>

        <div className="text-left mb-8 space-y-2">
          <p>
            <span className="font-semibold text-slate-700">Case ID:</span>{" "}
            <span className="text-gray-600">{navState.caseId || "N/A"}</span>
          </p>
          <p>
            <span className="font-semibold text-slate-700">Investigator:</span>{" "}
            <span className="text-gray-600">{navState.name || "Unknown"}</span>
          </p>
          <p>
            <span className="font-semibold text-slate-700">Role:</span>{" "}
            <span className="capitalize text-gray-600">{navState.role || "N/A"}</span>
          </p>
          <p>
            <span className="font-semibold text-slate-700">Authorized Officer:</span>{" "}
            <span className="text-gray-600">
              {navState.authorizedOfficer || "Dr. " + (navState.name || "Officer")}
            </span>
          </p>
        </div>

        {!result ? (
          <div className="text-center">
            <div className="animate-pulse text-cyan-700 font-medium mb-12">
              Analyzing data based on {navState.role || "inputs"}...
            </div>

            <button
              onClick={() => navigate("/explore")}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-8 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition"
            >
              Back to Explore
            </button>
          </div>
        ) : (
          <>
            <div className="text-left bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border border-cyan-100 mb-8">
              <h2 className="text-2xl font-semibold text-cyan-700 mb-4">
                Result Summary
              </h2>

              <p className="mb-3">
                <span className="font-medium text-slate-700">Poison Likely:</span>{" "}
                <span
                  className={`font-semibold ${
                    result.isPoisonLikely ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result.isPoisonLikely ? "Yes" : "No, there is no poisoning involved"}
                </span>
              </p>

              <p className="mb-3">
                <span className="font-medium text-slate-700">Probable Poison:</span>{" "}
                <span className="text-gray-700">{result.probablePoison}</span>
              </p>

              <div className="mb-3">
                <span className="font-medium text-slate-700">Suggested Tests:</span>
                <ul className="list-disc list-inside text-gray-700 mt-1 space-y-1">
                  {result.suggestedTests && result.suggestedTests.length > 0 ? (
                    result.suggestedTests.map((test, i) => <li key={i}>{test}</li>)
                  ) : (
                    <li>No tests suggested</li>
                  )}
                </ul>
              </div>

              <div className="mt-4">
                <p className="font-medium text-slate-700 mb-2">
                  Confidence Level:
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-3 rounded-full transition-all duration-700 ease-out ${
                      result.confidence > 80
                        ? "bg-green-500"
                        : result.confidence > 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
                <p className="text-gray-600 mt-1">{result.confidence}% confidence</p>
              </div>
            </div>

            {/* ✅ Buttons — visible on screen only */}
            <div className="flex justify-center gap-4">
              <button
                onClick={handleDownloadPDF}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-8 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition"
              >
                Download PDF
              </button>

              <button
                onClick={() => navigate("/explore")}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-2 px-8 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition"
              >
                Back to Explore
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
