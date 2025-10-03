
from flask import Flask, render_template, request, jsonify, send_file
import os
import csv
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def home():
	return render_template('index.html')

# Additional routes
@app.route('/about')
def about():
	return render_template('about.html')

@app.route('/product')
def product():
	return render_template('product.html')

# Services page removed per request

@app.route('/news')
def news():
	return render_template('news.html')

@app.route('/career')
def career():
    return render_template('career.html')

@app.route('/product/pharmaceutical')
def product_pharmaceutical():
	return render_template('product_pharmaceutical.html')

@app.route('/product/edible')
def product_edible():
	return render_template('product_edible.html')

@app.route('/product/fish')
def product_fish():
	return render_template('product_fish.html')

@app.route('/product/sheet')
def product_sheet():
	return render_template('product_sheet.html')

@app.route('/product/collagen')
def product_collagen():
	return render_template('product_collagen.html')

@app.route('/product/others')
def product_others():
	return render_template('product_others.html')


@app.route('/application')
def application_index():
	return render_template('application.html')


@app.route('/application/confectionery')
def application_confectionery():
	return render_template('application_confectionery.html')

@app.route('/application/dairy')
def application_dairy():
	return render_template('application_dairy.html')

@app.route('/application/desserts')
def application_desserts():
	return render_template('application_desserts.html')

@app.route('/application/gummies')
def application_gummies():
	return render_template('application_gummies.html')

@app.route('/application/meat')
def application_meat():
	return render_template('application_meat.html')

@app.route('/application/alcoholic')
def application_alcoholic():
	return render_template('application_alcoholic.html')

@app.route('/application/hard-capsules')
def application_hard_capsules():
	return render_template('application_hard_capsules.html')

@app.route('/application/soft-gels')
def application_soft_gels():
	return render_template('application_soft_gels.html')

@app.route('/application/microcapsules')
def application_microcapsules():
	return render_template('application_microcapsules.html')

@app.route('/application/tablets')
def application_tablets():
	return render_template('application_tablets.html')

@app.route('/application/specialty-pharma')
def application_specialty_pharma():
	return render_template('application_specialty_pharma.html')

@app.route('/application/industrial')
def application_industrial():
	return render_template('application_industrial.html')

@app.route('/application/food')
def application_food():
	return render_template('application_food.html')

@app.route('/application/pharmaceutical')
def application_pharmaceutical():
	return render_template('application_pharmaceutical.html')

@app.route('/application/health')
def application_health():
	return render_template('application_health.html')


@app.route('/faq')
def faq():
	return render_template('faq.html')


@app.route('/faq/report', methods=['POST'])
def faq_report():
	"""Receive FAQ report from client and append to a CSV under data/"""
	try:
		payload = request.get_json() or {}
		question = payload.get('question', '')
		page = payload.get('page', request.referrer or '')
		user_agent = request.headers.get('User-Agent', '')

		base = os.path.dirname(__file__)
		data_dir = os.path.join(base, 'data')
		os.makedirs(data_dir, exist_ok=True)
		csv_path = os.path.join(data_dir, 'faq_reports.csv')

		write_header = not os.path.exists(csv_path)
		with open(csv_path, 'a', newline='', encoding='utf-8') as f:
			writer = csv.writer(f)
			if write_header:
				writer.writerow(['timestamp', 'question', 'page', 'user_agent'])
			writer.writerow([datetime.utcnow().isoformat(), question, page, user_agent])

		return jsonify({'status': 'ok'}), 201
	except Exception as e:
		return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/admin/faq-reports')
def admin_faq_reports():
	"""Simple admin viewer for FAQ reports saved to data/faq_reports.csv.
	If the environment variable ADMIN_TOKEN is set, a matching `token` query
	parameter or `X-Admin-Token` header must be provided to view/download.
	"""
	base = os.path.dirname(__file__)
	csv_path = os.path.join(base, 'data', 'faq_reports.csv')
	admin_token = os.environ.get('ADMIN_TOKEN')
	token = request.args.get('token') or request.headers.get('X-Admin-Token')
	if admin_token and token != admin_token:
		return "Forbidden", 403

	rows = []
	if os.path.exists(csv_path):
		with open(csv_path, newline='', encoding='utf-8') as f:
			reader = csv.DictReader(f)
			for r in reader:
				rows.append(r)

	download_url = '/admin/faq-reports/download'
	if token:
		download_url += '?token=' + token

	return render_template('admin_faq_reports.html', rows=rows, csv_exists=os.path.exists(csv_path), download_url=download_url, admin_token=bool(admin_token))


@app.route('/admin/faq-reports/download')
def admin_faq_reports_download():
	base = os.path.dirname(__file__)
	csv_path = os.path.join(base, 'data', 'faq_reports.csv')
	admin_token = os.environ.get('ADMIN_TOKEN')
	token = request.args.get('token') or request.headers.get('X-Admin-Token')
	if admin_token and token != admin_token:
		return "Forbidden", 403
	if not os.path.exists(csv_path):
		return "No reports yet", 404
	return send_file(csv_path, as_attachment=True)

if __name__ == '__main__':
	# For local development you can run this file directly.
	# In production use a WSGI server such as gunicorn (see Procfile / Dockerfile).
	app.run(host='0.0.0.0', port=5000, debug=False)
