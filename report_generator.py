import pandas as pd
import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

class ReportGenerator:
    def __init__(self):
        self.reports_dir = 'reports'
        os.makedirs(self.reports_dir, exist_ok=True)
    
    def generate_csv_report(self, prediction_data):
        """Generate CSV report from prediction data"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'solar_prediction_report_{timestamp}.csv'
        filepath = os.path.join(self.reports_dir, filename)
        
        # Prepare data for CSV
        data = []
        
        if 'hourly_predictions' in prediction_data:
            # Daily report
            for hour_data in prediction_data['hourly_predictions']:
                data.append({
                    'Time': f"{hour_data['hour']:02d}:00",
                    'Power (W)': round(hour_data['power'], 2),
                    'Cumulative (Wh)': round(sum(p['power'] for p in prediction_data['hourly_predictions'][:hour_data['hour']+1]), 2)
                })
        elif 'daily_predictions' in prediction_data:
            # Weekly/Monthly report
            for day_data in prediction_data['daily_predictions']:
                data.append({
                    'Day': day_data['day'],
                    'Power (Wh)': round(day_data['power'], 2),
                    'Cumulative (Wh)': round(sum(p['power'] for p in prediction_data['daily_predictions'][:day_data['day']]), 2)
                })
        
        # Add summary data
        if data:  # Only add summary if there's data
            data.append({
                'Time': 'TOTAL',
                'Power (W)': round(prediction_data['total_power'], 2),
                'Cumulative (Wh)': round(prediction_data['total_power'], 2)
            })
        
        # Create DataFrame and save
        df = pd.DataFrame(data)
        df.to_csv(filepath, index=False)
        
        return filepath
    
    def generate_pdf_report(self, prediction_data):
        """Generate PDF report from prediction data"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'solar_prediction_report_{timestamp}.pdf'
        filepath = os.path.join(self.reports_dir, filename)
        
        # Create PDF document
        doc = SimpleDocTemplate(filepath, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Title
        title = Paragraph("Solar Power Generation Prediction Report", styles['Title'])
        story.append(title)
        story.append(Spacer(1, 12))
        
        # Report info
        report_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        info_text = f"Generated on: {report_date}"
        info = Paragraph(info_text, styles['Normal'])
        story.append(info)
        story.append(Spacer(1, 12))
        
        # Summary section
        summary_title = Paragraph("Summary", styles['Heading2'])
        story.append(summary_title)
        
        summary_data = [
            ['Metric', 'Value'],
            ['Total Power Generation', f"{prediction_data['total_power']:.2f} Wh"],
            ['Peak Power', f"{prediction_data.get('peak_power', 0):.2f} W"],
            ['Peak Hour', f"{prediction_data.get('peak_hour', 'N/A')}:00"],
            ['Average Daily', f"{prediction_data.get('average_daily', 0):.2f} Wh"]
        ]
        
        summary_table = Table(summary_data)
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        story.append(summary_table)
        story.append(Spacer(1, 12))
        
        # Detailed data section
        if 'hourly_predictions' in prediction_data:
            # Daily report
            data_title = Paragraph("Hourly Power Generation", styles['Heading2'])
            story.append(data_title)
            
            # Prepare hourly data
            hourly_data = [['Hour', 'Power (W)', 'Cumulative (Wh)']]
            cumulative = 0
            for hour_data in prediction_data['hourly_predictions']:
                cumulative += hour_data['power']
                hourly_data.append([
                    f"{hour_data['hour']:02d}:00",
                    f"{hour_data['power']:.2f}",
                    f"{cumulative:.2f}"
                ])
            
            hourly_table = Table(hourly_data)
            hourly_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(hourly_table)
            
        elif 'daily_predictions' in prediction_data:
            # Weekly/Monthly report
            data_title = Paragraph("Daily Power Generation", styles['Heading2'])
            story.append(data_title)
            
            # Prepare daily data
            daily_data = [['Day', 'Power (Wh)', 'Cumulative (Wh)']]
            cumulative = 0
            for day_data in prediction_data['daily_predictions']:
                cumulative += day_data['power']
                daily_data.append([
                    str(day_data['day']),
                    f"{day_data['power']:.2f}",
                    f"{cumulative:.2f}"
                ])
            
            daily_table = Table(daily_data)
            daily_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(daily_table)
        
        # Build PDF
        doc.build(story)
        
        return filepath
