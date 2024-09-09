from flask import Flask
from flask_cors import CORS
from routes.users import users_blueprint
from routes.roles import roles_blueprint
from routes.permissions import permissions_blueprint
from routes.stage import stages_blueprint
from routes.stage_permissions import stage_permissions_blueprint
from routes.orders import orders_blueprint

app = Flask(__name__)

# Configurar CORS para permitir solo el origen específico
cors = CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(users_blueprint, url_prefix='/users')
app.register_blueprint(roles_blueprint, url_prefix='/roles')
app.register_blueprint(permissions_blueprint, url_prefix='/permisos')
app.register_blueprint(stages_blueprint, url_prefix='/stages')
app.register_blueprint(stage_permissions_blueprint, url_prefix='/stage_permissions')
app.register_blueprint(orders_blueprint, url_prefix='/orders')


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
