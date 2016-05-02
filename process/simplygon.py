from flask import Flask, request, make_response
from flask_restful import Resource, Api
from json import dumps
import uuid
import os
from threading import Thread
import time 

import subprocess
#Create a engine for connecting to SQLite3.
#Assuming salaries.db is in your app root folder

#e = create_engine('sqlite:///salaries.db')

app = Flask(__name__)
api = Api(app)
work_directory = "c:/simplygonhifi/"
job_directory = work_directory + "/jobs/"
simplygon_hifi_dir = "C:\\test\\simplygonhifi\\simplygon\\"
simplygon_settings = simplygon_hifi_dir + "settings\\reduction.spl"
simplygon_binary = simplygon_hifi_dir + "SimplygonBatch\\SimplygonBatch.exe"

all_jobs = {}

class JOB_STATUS:
	PENDING = 0
	RUNNING = 1
	DONE = 2
	FAILED = 3

status_strings = ['PENDING', 'RUNNING', 'DONE', 'FAILED']

def run_job(uuid, job_directory, settings):
	work_directory = job_directory + '/' + uuid
	try:
		os.makedirs(work_directory + '/output')
	except:
		# TODO: Proper error handling here
		pass
	command_line = ['\"%s\"' % simplygon_binary,
		'--verbose', 
		'--forcereprocessing',  
		'--input \"%s\"' % work_directory, 
		'--spl \"%s\"' % simplygon_settings,
		'--output \"%s%s\"' % (work_directory, '\\output')]
	print(' '.join(command_line))
	p = subprocess.Popen(' '.join(command_line))
	p.wait()


class ProcessJob(Thread):
	def __init__(self, uuid, job_directory, settings):
		Thread.__init__(self)
		self.uuid = uuid
		self.job_directory = job_directory
		self.settings = settings
		self.status = JOB_STATUS.PENDING
	def run(self):
		self.status = JOB_STATUS.RUNNING
		run_job(self.uuid, self.job_directory, self.settings)
		self.status = JOB_STATUS.DONE

def create_job(uuid, job_directory, settings):
	all_jobs[uuid] = ProcessJob(uuid, job_directory, settings)
	all_jobs[uuid].start()
class Create(Resource):
	def post(self):
		job_ID = uuid.uuid4()
		# Create a job directory
		job_dir = job_directory + str(job_ID)
		os.makedirs(job_dir)
		f = open(job_dir + '/job.obj', 'w')
		f.write(request.data)
		f.flush()
		f.close()
		create_job(str(job_ID), job_directory, simplygon_settings)
		#print(request.data)
		return {'UUID' : str(job_ID)}

class Status(Resource):
	def get(self, uuid):
		print('Getting status for job %s' % uuid)
		try:
			print all_jobs[uuid].status
			return {'status' : status_strings[all_jobs[uuid].status]}
		except:
			print('Didn\'t find job %s' % uuid)
			return {'status' : 'UNKNOWN'}, 500

		#We can have PUT,DELETE,POST here. But in our API GET implementation is sufficient
 
class Download(Resource):
	def get(self, uuid):
		print('Download job %s' % uuid)
		try:
			if all_jobs[uuid].status != JOB_STATUS.DONE:
				return  {'status' : 'UNKNOW'}, 500
			print all_jobs[uuid].status
			job_dir = job_directory + uuid
			f = open(job_dir + '/output/reduction/job/LOD1/job_reduction_LOD1.obj', 'r')
			data = f.read()
			data = "#" + data
			#print(data)
			response = make_response(data)
			response.headers['content-type'] = 'application/octet-stream'	
			return response

		except:
			print('Didn\'t find job %s' % uuid)
			return {'status' : 'UNKNOWN'}, 500

api.add_resource(Status, '/simplygon/status/<string:uuid>')
api.add_resource(Create, '/simplygon/create')
api.add_resource(Download, '/simplygon/download/<string:uuid>')

if __name__ == '__main__':
	app.run(host= '0.0.0.0')
	#uuid = '8211f9f2-3a94-424f-9eac-3556d56ec3e8'
	#run_job(uuid, 'C:\\simplygonhifi\\jobs\\', simplygon_settings)
	#create_job(uuid, 'C:\\simplygonhifi\\jobs\\', simplygon_settings)
	#while all_jobs[uuid].status == JOB_STATUS.RUNNING:
	#	time.sleep(5)
	#	print("Running")

	#all_jobs[uuid].join()
	#t.join()
