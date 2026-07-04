import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth } from '../../firebase/firebase';
import { DISEASE_API_KEYS, SEVERITY_KEYS } from '../../i18n/diseaseKeys';

const severityColor = {
  Low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  High: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
};

// ── Hardcoded disease data for PDF ──────────────────────────────────────────
const DISEASE_INFO = {
  'Acne': {
    precautions: ['Wash face twice daily with mild cleanser', 'Avoid touching or popping pimples', 'Use non-comedogenic moisturizers', 'Stay hydrated and maintain a balanced diet'],
    treatments: ['Topical benzoyl peroxide or salicylic acid', 'Retinoid creams (adapalene, tretinoin)', 'Oral antibiotics for severe cases', 'Consult dermatologist for prescription medication'],
    doctorAdvice: 'See a dermatologist if acne is severe, leaves scars, or does not improve after 2-3 months of home treatment.',
  },
  'Actinic Keratosis': {
    precautions: ['Apply SPF 30+ sunscreen daily', 'Wear protective clothing and hats outdoors', 'Avoid sun exposure during peak hours (10am-4pm)', 'Regularly monitor affected skin areas'],
    treatments: ['Cryotherapy (freezing with liquid nitrogen)', 'Topical fluorouracil or imiquimod cream', 'Photodynamic therapy', 'Chemical peels or laser resurfacing'],
    doctorAdvice: 'Consult a dermatologist immediately — Actinic Keratosis can progress to skin cancer if left untreated.',
  },
  'Basal Cell Carcinoma': {
    precautions: ['Use broad-spectrum SPF 50+ sunscreen', 'Avoid tanning beds completely', 'Perform regular self-skin examinations', 'Wear UV-protective clothing'],
    treatments: ['Surgical excision (most common)', 'Mohs micrographic surgery', 'Radiation therapy for inoperable cases', 'Topical imiquimod for superficial cases'],
    doctorAdvice: 'Seek immediate medical attention. Basal Cell Carcinoma requires professional treatment — do not delay.',
  },
  'Eczema': {
    precautions: ['Moisturize skin at least twice daily', 'Avoid known triggers (soaps, detergents, stress)', 'Wear soft, breathable cotton clothing', 'Keep nails short to prevent scratching'],
    treatments: ['Topical corticosteroid creams', 'Calcineurin inhibitors (tacrolimus)', 'Antihistamines for itching relief', 'Dupilumab injections for severe cases'],
    doctorAdvice: 'See a doctor if eczema is widespread, infected, or severely affects sleep and daily activities.',
  },
  'Psoriasis': {
    precautions: ['Keep skin well moisturized', 'Avoid triggers like stress, alcohol, and smoking', 'Get moderate sun exposure (with care)', 'Use gentle, fragrance-free skin products'],
    treatments: ['Topical corticosteroids and vitamin D analogs', 'Methotrexate or cyclosporine for severe cases', 'Biologic drugs (adalimumab, etanercept)', 'Phototherapy (UVB light treatment)'],
    doctorAdvice: 'Consult a dermatologist for a proper treatment plan — psoriasis is a chronic condition requiring long-term management.',
  },
  'Ringworm': {
    precautions: ['Keep affected area clean and dry', 'Do not share towels, clothing, or combs', 'Wash hands frequently', 'Disinfect shared surfaces and sportswear'],
    treatments: ['Topical antifungal creams (clotrimazole, miconazole)', 'Oral antifungals (terbinafine, fluconazole) for severe cases', 'Keep area dry and exposed to air', 'Continue treatment for 2 weeks after symptoms clear'],
    doctorAdvice: 'See a doctor if ringworm spreads, does not improve within 2 weeks, or affects the scalp or nails.',
  },
  'Rosacea': {
    precautions: ['Identify and avoid personal triggers (spicy food, alcohol, sun)', 'Use gentle, fragrance-free skincare products', 'Always wear SPF 30+ sunscreen', 'Avoid extreme temperature changes'],
    treatments: ['Topical metronidazole or azelaic acid', 'Oral antibiotics (doxycycline) for flare-ups', 'Laser or light therapy for redness', 'Brimonidine gel to reduce flushing'],
    doctorAdvice: 'Consult a dermatologist for diagnosis confirmation and to create a long-term management plan.',
  },
  'Seborrheic Keratosis': {
    precautions: ['Monitor lesions for sudden changes in size or color', 'Avoid irritating affected areas', 'Protect skin from excessive sun exposure', 'Keep skin moisturized'],
    treatments: ['Cryotherapy for removal if desired', 'Electrosurgery or curettage', 'Laser treatment for cosmetic removal', 'No treatment needed if asymptomatic'],
    doctorAdvice: 'See a doctor if a lesion rapidly changes, bleeds, or becomes painful to rule out malignancy.',
  },
  'Vitiligo': {
    precautions: ['Use SPF 50+ sunscreen on depigmented areas', 'Avoid skin trauma to affected areas', 'Use camouflage makeup if desired', 'Manage stress through relaxation techniques'],
    treatments: ['Topical corticosteroids or calcineurin inhibitors', 'Narrowband UVB phototherapy', 'Skin grafting for stable vitiligo', 'Ruxolitinib cream (FDA approved 2022)'],
    doctorAdvice: 'Consult a dermatologist to confirm diagnosis and explore treatment options for repigmentation.',
  },
  'Warts': {
    precautions: ['Avoid touching warts and then other body parts', 'Keep warts covered with a bandage', 'Do not share personal items', 'Wash hands thoroughly after touching warts'],
    treatments: ['Salicylic acid topical treatment', 'Cryotherapy (liquid nitrogen freezing)', 'Electrosurgery or laser removal', 'Immunotherapy for resistant warts'],
    doctorAdvice: 'See a doctor if warts are painful, spreading rapidly, on the face/genitals, or do not respond to home treatment.',
  },
};

const getDiseaseInfo = (diseaseName) => {
  return DISEASE_INFO[diseaseName] || {
    precautions: ['Consult a qualified dermatologist', 'Keep the affected area clean', 'Avoid self-medication', 'Monitor for any changes'],
    treatments: ['Professional medical evaluation required', 'Treatment depends on confirmed diagnosis', 'Follow your dermatologist\'s advice'],
    doctorAdvice: 'Please consult a certified dermatologist for proper diagnosis and treatment.',
  };
};

const PredictionResult = ({ data, image, images, isConsensus = false }) => {
  const { t } = useTranslation();
  const [downloading, setDownloading] = useState(false);

  const translateDisease = (name) => {
    const key = DISEASE_API_KEYS[name];
    if (key) return t(`dashboard.diseases.${key}.name`);
    if (name === 'Others') return t('dashboard.prediction.others');
    return name;
  };

  const sevKey = SEVERITY_KEYS[data.severity];
  const severityLabel = t(`dashboard.severity.${sevKey}`);
  const severityHint =
    data.severity === 'Low'
      ? t('dashboard.severity.benign')
      : data.severity === 'Medium'
      ? t('dashboard.severity.monitor')
      : t('dashboard.severity.urgent');

  // ─── PDF Download ─────────────────────────────────────────────────────────
  const downloadReport = async () => {
    setDownloading(true);
    try {
      const { default: jsPDF } = await import('jspdf');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = 210;
      const pageH = 297;
      const margin = 15;
      const contentW = pageW - margin * 2;
      let y = 0;

      const user = auth.currentUser;
      const patientName = user?.displayName || 'Patient';
      const patientEmail = user?.email || 'N/A';
      const reportId = 'DL-' + Date.now().toString(36).toUpperCase();
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const diseaseInfo = getDiseaseInfo(data.disease);

      const addPageIfNeeded = (neededHeight) => {
        if (y + neededHeight > pageH - 18) {
          pdf.addPage();
          y = margin;
        }
      };

      const drawRect = (x, ry, w, h, r = 3, fillColor = null, strokeColor = null) => {
        if (fillColor) pdf.setFillColor(...fillColor);
        if (strokeColor) pdf.setDrawColor(...strokeColor);
        if (fillColor && strokeColor) pdf.roundedRect(x, ry, w, h, r, r, 'FD');
        else if (fillColor) pdf.roundedRect(x, ry, w, h, r, r, 'F');
        else pdf.roundedRect(x, ry, w, h, r, r, 'S');
      };

      const sectionTitle = (title) => {
        addPageIfNeeded(14);
        pdf.setFillColor(37, 99, 235);
        pdf.roundedRect(margin, y, 3, 7, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(11);
        pdf.setTextColor(30, 41, 59);
        pdf.text(title, margin + 6, y + 5.5);
        y += 11;
      };

      // ── HEADER ──────────────────────────────────────────────────────────────
      pdf.setFillColor(37, 99, 235);
      pdf.rect(0, 0, pageW, 42, 'F');

      // DermaLens logo text
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Derma', margin, 18);
      const dermaW = pdf.getTextWidth('Derma');
      pdf.setTextColor(147, 197, 253); // blue-300
      pdf.text('Lens', margin + dermaW, 18);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8.5);
      pdf.setTextColor(186, 230, 253);
      pdf.text('AI-Powered Skin Disease Detection Report', margin, 25);

      // Report ID + date on right
      pdf.setFontSize(7.5);
      pdf.setTextColor(186, 230, 253);
      pdf.text(`Report ID: ${reportId}`, pageW - margin, 13, { align: 'right' });
      pdf.text(`Date: ${dateStr}`, pageW - margin, 20, { align: 'right' });
      pdf.text(`Time: ${timeStr}`, pageW - margin, 26, { align: 'right' });

      if (isConsensus) {
        pdf.setFillColor(99, 102, 241);
        pdf.roundedRect(pageW - margin - 30, 30, 30, 8, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.text('CONSENSUS REPORT', pageW - margin - 15, 35.2, { align: 'center' });
      }

      y = 50;

      // ── PATIENT INFO ────────────────────────────────────────────────────────
      drawRect(margin, y, contentW, 18, 3, [241, 245, 249], [226, 232, 240]);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text('PATIENT NAME', margin + 5, y + 6);
      pdf.text('EMAIL', margin + contentW * 0.38, y + 6);
      pdf.text('REPORT TYPE', margin + contentW * 0.72, y + 6);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(15, 23, 42);
      pdf.text(patientName, margin + 5, y + 13);
      pdf.text(patientEmail, margin + contentW * 0.38, y + 13);
      pdf.text(isConsensus ? 'Multi-Image Consensus' : 'Single Image Scan', margin + contentW * 0.72, y + 13);
      y += 24;

      // ── SCANNED IMAGE(S) ─────────────────────────────────────────────────────
      // For consensus reports, `images` holds every analyzed spot image and all
      // of them are drawn in a grid. For single-image reports, fall back to the
      // single `image` prop.
      const allImages = (images && images.length > 0) ? images : (image ? [image] : []);

      if (allImages.length > 0) {
        sectionTitle(allImages.length > 1 ? `Scanned Images (${allImages.length})` : 'Scanned Image');

        if (allImages.length === 1) {
          try {
            const imgMaxW = contentW * 0.48;
            const imgMaxH = 58;
            const imgX = margin + (contentW - imgMaxW) / 2;
            drawRect(imgX - 2, y - 1, imgMaxW + 4, imgMaxH + 4, 4, [248, 250, 252], [226, 232, 240]);
            const imgObj = new window.Image();
            imgObj.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => { imgObj.onload = resolve; imgObj.onerror = reject; imgObj.src = allImages[0]; });
            const iRatio = imgObj.naturalWidth / imgObj.naturalHeight;
            let iW = imgMaxW; let iH = iW / iRatio;
            if (iH > imgMaxH) { iH = imgMaxH; iW = iH * iRatio; }
            const canvas = document.createElement('canvas');
            canvas.width = imgObj.naturalWidth; canvas.height = imgObj.naturalHeight;
            canvas.getContext('2d').drawImage(imgObj, 0, 0);
            pdf.addImage(canvas.toDataURL('image/jpeg', 0.85), 'JPEG', imgX + (imgMaxW - iW) / 2, y + (imgMaxH - iH) / 2, iW, iH);
            y += imgMaxH + 8;
          } catch {
            pdf.setFontSize(8); pdf.setTextColor(100, 116, 139);
            pdf.text('[Image not available]', pageW / 2, y + 20, { align: 'center' });
            y += 30;
          }
        } else {
          // Grid layout: up to 3 columns, wrapping to additional rows/pages as needed.
          const cols = Math.min(3, allImages.length);
          const gap = 4;
          const cellW = (contentW - gap * (cols - 1)) / cols;
          const cellH = 42;

          for (let i = 0; i < allImages.length; i++) {
            const col = i % cols;
            if (col === 0) addPageIfNeeded(cellH + 6);
            const cellX = margin + col * (cellW + gap);

            drawRect(cellX - 1, y - 1, cellW + 2, cellH + 2, 3, [248, 250, 252], [226, 232, 240]);
            try {
              const imgObj = new window.Image();
              imgObj.crossOrigin = 'anonymous';
              await new Promise((resolve, reject) => { imgObj.onload = resolve; imgObj.onerror = reject; imgObj.src = allImages[i]; });
              const iRatio = imgObj.naturalWidth / imgObj.naturalHeight;
              let iW = cellW - 4; let iH = iW / iRatio;
              if (iH > cellH - 4) { iH = cellH - 4; iW = iH * iRatio; }
              const canvas = document.createElement('canvas');
              canvas.width = imgObj.naturalWidth; canvas.height = imgObj.naturalHeight;
              canvas.getContext('2d').drawImage(imgObj, 0, 0);
              pdf.addImage(
                canvas.toDataURL('image/jpeg', 0.85), 'JPEG',
                cellX + (cellW - iW) / 2, y + (cellH - iH) / 2, iW, iH
              );
            } catch {
              pdf.setFontSize(7); pdf.setTextColor(100, 116, 139);
              pdf.text('[Image not available]', cellX + cellW / 2, y + cellH / 2, { align: 'center' });
            }

            pdf.setFontSize(6.5); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(100, 116, 139);
            pdf.text(`Spot ${i + 1}`, cellX + cellW / 2, y + cellH + 4, { align: 'center' });

            if (col === cols - 1 || i === allImages.length - 1) {
              y += cellH + 8;
            }
          }
          y += 2;
        }
      }

      // ── PREDICTION SUMMARY ───────────────────────────────────────────────────
      sectionTitle('Prediction Summary');
      const cardH = 30;
      const cardW = (contentW - 8) / 3;

      // Condition
      drawRect(margin, y, cardW, cardH, 3, [239, 246, 255], [191, 219, 254]);
      pdf.setFontSize(7); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(37, 99, 235);
      pdf.text('CONDITION', margin + 4, y + 7);
      pdf.setFontSize(10); pdf.setTextColor(15, 23, 42);
      pdf.text(pdf.splitTextToSize(data.disease, cardW - 8)[0], margin + 4, y + 17);

      // Confidence
      const confX = margin + cardW + 4;
      drawRect(confX, y, cardW, cardH, 3, [245, 243, 255], [221, 214, 254]);
      pdf.setFontSize(7); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(109, 40, 217);
      pdf.text('CONFIDENCE', confX + 4, y + 7);
      pdf.setFontSize(14); pdf.setTextColor(15, 23, 42);
      pdf.text(`${data.confidence}%`, confX + 4, y + 19);
      pdf.setFillColor(221, 214, 254);
      pdf.roundedRect(confX + 4, y + 22, cardW - 12, 3, 1, 1, 'F');
      pdf.setFillColor(139, 92, 246);
      pdf.roundedRect(confX + 4, y + 22, Math.max((cardW - 12) * (data.confidence / 100), 1), 3, 1, 1, 'F');

      // Severity
      const sevX = margin + (cardW + 4) * 2;
      const sevBg = data.severity === 'Low' ? [240, 253, 244] : data.severity === 'Medium' ? [255, 251, 235] : [254, 242, 242];
      const sevBorder = data.severity === 'Low' ? [187, 247, 208] : data.severity === 'Medium' ? [253, 230, 138] : [254, 202, 202];
      const sevTextColor = data.severity === 'Low' ? [21, 128, 61] : data.severity === 'Medium' ? [180, 83, 9] : [185, 28, 28];
      drawRect(sevX, y, cardW, cardH, 3, sevBg, sevBorder);
      pdf.setFontSize(7); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(...sevTextColor);
      pdf.text('RISK LEVEL', sevX + 4, y + 7);
      pdf.setFontSize(11); pdf.text(`${data.severity} Risk`, sevX + 4, y + 17);
      pdf.setFontSize(7); pdf.setFont('helvetica', 'normal');
      pdf.text(
        data.severity === 'Low' ? 'Generally benign' : data.severity === 'Medium' ? 'Monitor closely' : 'Seek urgent care',
        sevX + 4, y + 24
      );
      y += cardH + 10;

      // ── PROBABILITY BREAKDOWN ─────────────────────────────────────────────────
      sectionTitle('Probability Breakdown');
      data.probabilities.forEach((item, index) => {
        addPageIfNeeded(13);
        const isTop = index === 0;
        pdf.setFont('helvetica', isTop ? 'bold' : 'normal');
        pdf.setFontSize(9); pdf.setTextColor(51, 65, 85);
        pdf.text(item.name, margin, y + 4);
        pdf.setFont('helvetica', 'bold'); pdf.setTextColor(30, 41, 59);
        pdf.text(`${item.score}%`, pageW - margin, y + 4, { align: 'right' });
        pdf.setFillColor(isTop ? 219 : 226, isTop ? 234 : 232, isTop ? 254 : 240);
        pdf.roundedRect(margin, y + 6, contentW, 3.5, 1, 1, 'F');
        pdf.setFillColor(isTop ? 59 : 148, isTop ? 130 : 163, isTop ? 246 : 184);
        pdf.roundedRect(margin, y + 6, Math.max(contentW * item.score / 100, 0.5), 3.5, 1, 1, 'F');
        y += 12;
      });
      y += 4;

      // ── PRECAUTIONS ───────────────────────────────────────────────────────────
      sectionTitle('Precautions & Self-Care');
      drawRect(margin, y, contentW, 4 + diseaseInfo.precautions.length * 9, 3, [240, 253, 244], [187, 247, 208]);
      diseaseInfo.precautions.forEach((p, i) => {
        addPageIfNeeded(10);
        pdf.setFillColor(34, 197, 94);
        pdf.circle(margin + 6, y + 4, 1.5, 'F');
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(20, 83, 45);
        const lines = pdf.splitTextToSize(p, contentW - 16);
        pdf.text(lines[0], margin + 10, y + 5.5);
        y += 9;
      });
      y += 6;

      // ── TREATMENTS ────────────────────────────────────────────────────────────
      sectionTitle('Common Treatments');
      drawRect(margin, y, contentW, 4 + diseaseInfo.treatments.length * 9, 3, [239, 246, 255], [191, 219, 254]);
      diseaseInfo.treatments.forEach((tr, i) => {
        addPageIfNeeded(10);
        pdf.setFillColor(37, 99, 235);
        pdf.circle(margin + 6, y + 4, 1.5, 'F');
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(30, 58, 138);
        const lines = pdf.splitTextToSize(tr, contentW - 16);
        pdf.text(lines[0], margin + 10, y + 5.5);
        y += 9;
      });
      y += 6;

      // ── WHEN TO SEE A DOCTOR ──────────────────────────────────────────────────
      addPageIfNeeded(30);
      sectionTitle('When to See a Doctor');
      const doctorBoxH = 18;
      drawRect(margin, y, contentW, doctorBoxH, 3, [254, 242, 242], [254, 202, 202]);
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(8); pdf.setTextColor(185, 28, 28);
      pdf.text('Medical Advice:', margin + 5, y + 7);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(153, 27, 27);
      const doctorLines = pdf.splitTextToSize(diseaseInfo.doctorAdvice, contentW - 10);
      pdf.text(doctorLines, margin + 5, y + 13);
      y += doctorBoxH + 8;

      // ── GRAD-CAM ──────────────────────────────────────────────────────────────
      if (data.gradcam_url) {
        sectionTitle('Grad-CAM Heatmap');
        pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(100, 116, 139);
        pdf.text('AI attention map highlighting the affected skin regions detected by the model.', margin, y);
        y += 6;
        try {
          const gcMaxW = contentW * 0.52; const gcMaxH = 58;
          const gcX = margin + (contentW - gcMaxW) / 2;
          drawRect(gcX - 2, y - 1, gcMaxW + 4, gcMaxH + 4, 4, [248, 250, 252], [226, 232, 240]);
          const gcImg = new window.Image();
          gcImg.crossOrigin = 'anonymous';
          await new Promise((res, rej) => { gcImg.onload = res; gcImg.onerror = rej; gcImg.src = data.gradcam_url; });
          const gcRatio = gcImg.naturalWidth / gcImg.naturalHeight;
          let gcW = gcMaxW; let gcH = gcW / gcRatio;
          if (gcH > gcMaxH) { gcH = gcMaxH; gcW = gcH * gcRatio; }
          const gcCanvas = document.createElement('canvas');
          gcCanvas.width = gcImg.naturalWidth; gcCanvas.height = gcImg.naturalHeight;
          gcCanvas.getContext('2d').drawImage(gcImg, 0, 0);
          pdf.addImage(gcCanvas.toDataURL('image/jpeg', 0.85), 'JPEG', gcX + (gcMaxW - gcW) / 2, y + (gcMaxH - gcH) / 2, gcW, gcH);
          y += gcMaxH + 10;
        } catch {
          pdf.setFontSize(8); pdf.setTextColor(100, 116, 139);
          pdf.text('[Grad-CAM not available]', pageW / 2, y + 15, { align: 'center' });
          y += 25;
        }
      }

      // ── DISCLAIMER ────────────────────────────────────────────────────────────
      addPageIfNeeded(26);
      drawRect(margin, y, contentW, 22, 4, [255, 251, 235], [253, 230, 138]);
      pdf.setFontSize(8); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(146, 64, 14);
      pdf.text('Medical Disclaimer', margin + 5, y + 7);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(120, 53, 15);
      const disc = 'This report is AI-generated for informational purposes only and does not constitute medical advice. Always consult a qualified dermatologist or healthcare professional for diagnosis and treatment.';
      pdf.text(pdf.splitTextToSize(disc, contentW - 10), margin + 5, y + 13);
      y += 26;

      // ── FOOTER on every page ──────────────────────────────────────────────────
      const totalPages = pdf.internal.getNumberOfPages();
      for (let p = 1; p <= totalPages; p++) {
        pdf.setPage(p);
        pdf.setFillColor(248, 250, 252);
        pdf.rect(0, pageH - 12, pageW, 12, 'F');
        pdf.setDrawColor(226, 232, 240);
        pdf.line(0, pageH - 12, pageW, pageH - 12);
        pdf.setFontSize(7); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(148, 163, 184);
        pdf.text(`DermaLens  |  Report ID: ${reportId}  |  For informational use only`, margin, pageH - 5);
        pdf.text(`Page ${p} of ${totalPages}`, pageW - margin, pageH - 5, { align: 'right' });
      }

      // ── SAVE ─────────────────────────────────────────────────────────────────
      pdf.save(`DermaLens_${data.disease.replace(/\s+/g, '_')}_${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}.pdf`);

    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">{t('dashboard.prediction.title')}</h2>
          </div>
          <button
            onClick={downloadReport}
            disabled={downloading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/40"
          >
            {downloading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download Report
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-1">{t('dashboard.prediction.condition')}</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">{translateDisease(data.disease)}</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800">
            <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">{t('dashboard.prediction.confidence')}</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">{data.confidence}%</div>
            <div className="w-full bg-purple-100 dark:bg-purple-900/40 rounded-full h-1.5 mt-2">
              <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${data.confidence}%` }} />
            </div>
          </div>
          <div className={`rounded-xl p-4 border ${severityColor[data.severity]}`}>
            <div className="text-xs font-semibold mb-1 opacity-70">{t('dashboard.prediction.severity')}</div>
            <div className="text-lg font-bold">{t('dashboard.severity.risk', { level: severityLabel })}</div>
            <div className="text-xs mt-1 opacity-70">
              {data.severity === 'Low' && '✅ '}
              {data.severity === 'Medium' && '⚠️ '}
              {data.severity === 'High' && '🚨 '}
              {severityHint}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            📊 {t('dashboard.prediction.probabilities')}
          </h3>
          <div className="space-y-3">
            {data.probabilities.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                  <span>{translateDisease(item.name)}</span>
                  <span className="font-medium">{item.score}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${index === 0 ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-500'}`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl p-4 flex gap-3">
        <span className="text-xl">⚠️</span>
        <p className="text-amber-700 dark:text-amber-400 text-sm">
          {t('dashboard.prediction.disclaimer')}
        </p>
      </div>
    </div>
  );
};

export default PredictionResult;
