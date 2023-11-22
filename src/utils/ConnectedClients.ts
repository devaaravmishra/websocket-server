class ConnectedClients {
	private numberOfConnectedClients: number = 0;

	public get count() {
		return this.numberOfConnectedClients;
	}

	public increment() {
		this.numberOfConnectedClients++;
	}

	public decrement() {
		if (this.numberOfConnectedClients > 0) {
			this.numberOfConnectedClients--;
		}
	}

	public reset() {
		this.numberOfConnectedClients = 0;
	}

	public set(count: number) {
		this.numberOfConnectedClients = Math.max(count, 0);
	}
}

export default ConnectedClients;
